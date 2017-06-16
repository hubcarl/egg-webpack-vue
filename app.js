'use strict';
const path = require('path');
const co = require('co');
const Manifest = require('webpack-manifest-normalize');
module.exports = app => {
  if (app.view) {
    app.view.resolve = function* (name) {
      return name;
    };
  }

  if (app.vue) {
    const renderBundle = app.vue.renderBundle;
    app.vue.renderBundle = (name, context, options) => {
      const filePath = path.isAbsolute(name) ? name : path.join(app.config.view.root[0], name);
      const promise = app.webpack.fileSystem.readWebpackMemoryFile(filePath, name);
      return co(function* () {
        const content = yield promise;
        return renderBundle.bind(app.vue)(content, context, options);
      });
    };
  }

  app.messenger.on(app.webpack.Constant.EVENT_WEBPACK_BUILD_STATE, data => {
    if (data.state) {
      const filepath = app.config.webpackvue.manifest;
      const promise = app.webpack.fileSystem.readWebpackMemoryFile(filepath);
      promise.then(content => {
        if (content) {
          Manifest.saveFile(filepath, content);
        }
      });
    }
  });
};
