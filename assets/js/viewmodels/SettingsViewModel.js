function SettingGroup(options, settings) {
	var self = this;

	self.title = ko.observable(options.title);
	self.settings = ko.observableArray(options.settings.map(function (setting) {
		return new Setting(setting, settings);
	}));
};

function Setting(options, settings) {
	var self = this;

	self.template    = ko.observable(options.type+'-template');
	self.key         = ko.observable(options.key);
	self.humanKey    = ko.observable(options.key.capitalize());
	self.description = ko.observable(options.description);
	self.enabled     = ko.observable(options.key in settings);
	self.value       = ko.observable(settings[options.key] || options.default);

	self.prompt = function (vm, event) {
		console.log(event);
	};
}

function SettingsViewModel() {
	var self = this;

	self.template = ko.observable('settings-template');
	self.title    = ko.observable('Settings');

	self.settings = ko.observableArray([]);

	self.load = function (done) {
		$.get({
			url: '/api/settings',
			success: function (settings) {
				$.get({
					url: '/assets/json/settings_model.json',
					success: function (data) {
						self.settings(data.map(function (group) {
							return new SettingGroup(group, settings);
						}));
					},
					error: function (xhr) {
						alert('Something went wrong: '+xhr.status);
					}
				});
			},
			error: function (xhr) {
				alert('Something went wrong: '+xhr.status);
			}
		});
		done();
	};
}

