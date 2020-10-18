const mustache = require('mustache');
const fs = require('fs');
const path = require('path');

const {promisify} = require('util');

const ROOT_DIR = path.dirname(__dirname);

function _read_template(cfg, template_id, callback) {
	const templates_dir = path.join(
		ROOT_DIR,
		(cfg('production', false) ? 'dist/templates' : 'templates')
	);
	const in_fn = path.join(templates_dir, template_id + '.mustache');

	fs.readFile(in_fn, function (err, template_bytes) {
		if (err) {
			return callback(err, null);
		}
		const template = template_bytes.toString();
		callback(null, template);
	});
}

function _find_partial_references(parsed, res) {
	if (res === undefined) {
		res = [];
	}
	parsed.forEach(function(p) {
		switch (p[0]) {
		case '>':
			res.push(p[1]);
			break;
		case '#':
		case '^':
			_find_partial_references(p[4], res);
			break;
		}
	});
	return res;
}

function _find_partials(cfg, template_id, callback, found, outstanding) {
	if (!found) {
		found = {};
	}
	if (!outstanding) {
		outstanding = [];
	}

	_read_template(cfg, template_id, function(err, template) {
		if (err) {
			return callback(err, null);
		}

		found[template_id] = template;

		const parsed = mustache.parse(template);
		const referenced = _find_partial_references(parsed);

		outstanding.push.apply(outstanding, referenced);
		outstanding = outstanding.filter(function (o) {
			return found[o] === undefined;
		});
		if (outstanding.length === 0) {
			callback(null, found);
		} else {
			const next_id = outstanding.pop();
			_find_partials(cfg, next_id, callback, found, outstanding);
		}
	});
}

function render_mustache(cfg, template_id, data, callback) {
	_find_partials(cfg, template_id, function(err, partials) {
		if (err) {
			return callback(err, null);
		}
		const html = mustache.render(partials[template_id], data, partials);
		callback(null, html);
	});
}

function add_helper_funcs(data) {
	data.urlencode = encodeURIComponent;
}

function render(req, res, next, template_id, data, no_scaffold) {
	const cfg = req.app.cfg;
	add_helper_funcs(data);
	data.root_path = req.app.root_path;
	data.static_path = req.app.root_path + 'static/';
	data.production = cfg('production', false);
	data.report_problems = cfg('report_problems', true);
	data.note_html = cfg('note_html', '');
	render_mustache(cfg, template_id, data, function(err, content) {
		if (err) {
			return next(err);
		}
		if (no_scaffold) {
			return res.send(content);
		}

		data.content = content;
		render_mustache(cfg, 'scaffold', data, function(err, html) {
			if (err) {
				return next(err);
			}
			res.send(html);
		});
	});
}

async function async_render(req, res, template_id, data, no_scaffold) {
	const cfg = req.app.cfg;
	add_helper_funcs(data);
	data.root_path = req.app.root_path;
	data.static_path = req.app.root_path + 'static/';
	data.production = cfg('production', false);
	data.report_problems = cfg('report_problems', true);
	data.note_html = cfg('note_html', '');
	const content = await promisify(render_mustache)(cfg, template_id, data);

	if (no_scaffold) {
		return res.send(content);
	}

	data.content = content;
	const html = await promisify(render_mustache)(cfg, 'scaffold', data);
	res.send(html);
}

module.exports = render;
render.async_render = async_render;
