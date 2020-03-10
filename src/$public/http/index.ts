export const http = {
  normalize: {
    q: function (obj, urlEncode) {
      function flattenObj(x, path) {
        const result = [];

        path = path || [];
        Object.keys(x).forEach(function (key) {
          if (!x.hasOwnProperty(key)) return;

          const newPath = path.slice();
          newPath.push(key);

          let vals = [];
          if (typeof x[key] == 'object') {
            vals = flattenObj(x[key], newPath);
          } else {
            vals.push({ path: newPath, val: x[key] });
          }
          vals.forEach(function (obj) {
            return result.push(obj);
          });
        });

        return result;
      }

      let parts = flattenObj(obj);

      parts = parts.map(function (varInfo) {
        if (varInfo.path.length == 1) varInfo.path = varInfo.path[0]; else {
          const first = varInfo.path[0];
          const rest = varInfo.path.slice(1);
          varInfo.path = first + '[' + rest.join('][') + ']';
        }
        return varInfo;
      });

      const queryString = parts.map(function (varInfo) {
        return varInfo.path + '=' + varInfo.val;
      }).join('&');
      if (urlEncode)
        return encodeURIComponent(queryString);
      else
        return queryString;
    },
  },
  ajax: {
    request: function (ops) {
      if (typeof ops == 'string')
        ops = { url: ops };

      ops.url = ops.url || '';
      ops.method = ops.method || 'get';
      ops.data = ops.data || {};

      const api = {
        /* jshint expr: true */
        host: {},
        process: function (ops) {
          const self = this;
          this.xhr = null;

          if (window.ActiveXObject) {
            this.xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
          } else if (window.XMLHttpRequest) {
            this.xhr = new XMLHttpRequest();
          }

          if (this.xhr) {
            this.xhr.onreadystatechange = function () {
              if (self.xhr.readyState == 4) {
                let result = self.xhr.responseText || '{}';

                if (typeof ops.raw == 'undefined' && typeof JSON !== 'undefined') {
                  result = JSON.parse(result);
                }

                self.alwaysCallback && self.alwaysCallback.apply(self.host, [result, self.xhr]);
              }
            };
          }

          if (ops.method.toUpperCase() == 'GET') {
            ops.url += '?' + EBANX.http.normalize.q(ops.data);
            delete ops.data;
          }

          this.xhr.open(ops.method.toUpperCase(), ops.url, true);

          setTimeout(function () {
            self.xhr.send(ops.data);
          }, 20);

          return this;
        },
        always: function (callback) {
          this.alwaysCallback = callback;
          return this;
        },
      };
      return api.process(ops);
    },
  },
  injectJS: function (src, cb) {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.onload = cb;
    s.src = src;
    document.getElementsByTagName('head')[0].appendChild(s);
  },
};
