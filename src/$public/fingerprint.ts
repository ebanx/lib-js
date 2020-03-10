export const deviceFingerprint = {
  ebanxSessionId: null,
  providerSessionList: [],
  postProvidersRemaining: 0,
  onSuccessCallback: null,
  onErrorCallback: null,

  setup: function (onSuccess, onError) {
    this.onSuccessCallback = onSuccess || console.log;
    this.onErrorCallback = onError || console.error;

    this.getList(function (providersList) {
      try {
        if (!providersList) throw new Error('EBANX.deviceFingerprint.setup - providersList is missing');
        if (!providersList.ebanx_session_id) throw new Error('EBANX.deviceFingerprint.setup - ebanx_session_id is missing');

        if (!providersList.providers || !providersList.providers.length) {
          return this.onSuccessCallback(providersList.ebanx_session_id);
        }

        this.ebanxSessionId = providersList.ebanx_session_id;
        // This variable is duplicated for compatibility with providers scripts
        this.ebanx_session_id = this.ebanxSessionId;
        this.postProvidersRemaining = providersList.providers.length;

        providersList.providers.forEach(function (provider) {
          this.loadProvider(provider, this.saveProviderSessionList.bind(this));
        }.bind(this));
      } catch (e) {
        this.onErrorCallback(e);
      }
    }.bind(this));
  },

  getList: function (cb) {
    EBANX.http.ajax
      .request({
        url: EBANX.utils.api.resources.fingerPrintResource().url,
        data: {
          publicIntegrationKey: EBANX.config.getPublishableKey(),
          country: EBANX.config.getCountry(),
        },
      })
      .always(cb);
  },

  saveProviderSessionList: function (providerSession) {
    this.postProvidersRemaining--;
    this.providerSessionList.push(providerSession);

    if (!this.postProvidersRemaining) {
      this.postProviderSessionList();
    }
  },

  postProviderSessionList: function () {
    const ebanxSessionId = this.ebanxSessionId;
    const providersSessionList = this.providerSessionList;
    const onSuccessCallback = this.onSuccessCallback;
    const onErrorCallback = this.onErrorCallback;

    this.ebanxSessionId = null;
    this.providerSessionList = [];
    this.onSuccessCallback = null;
    this.onErrorCallback = null;

    const data = {
      publicIntegrationKey: EBANX.config.getPublishableKey(),
      ebanx_session_id: ebanxSessionId,
      providers: providersSessionList,
    };

    const resource = EBANX.utils.api.resources.fingerPrintProvidersResource();

    EBANX.http.ajax
      .request({
        url: resource.url,
        method: resource.method,
        data: data,
      })
      .always(function (data, xhr) {
        if (xhr.status == 200) {
          onSuccessCallback(ebanxSessionId);
        } else {
          onErrorCallback(new Error('postProviderSessionList - xhr.status != 200, received value: ' + xhr.status));
        }
      });
  },

  loadProvider: function (data, cb) {
    EBANX.http.injectJS(data.source, function () {
      EBANX.deviceFingerprint[data.provider].setup(data.settings, function (sessionId) {
        cb({
          provider: data.provider,
          session_id: sessionId,
        });
      });
    });
  },
};
