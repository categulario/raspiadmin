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
	self.options     = ko.observable(options.options || []);

	self.prompt = function (vm, event) {
		if (self.template() == 'bool-template') {
			// this template is easy, just toggle the value and return
			self.value(!self.value());
			$.ajax({
				type: 'put',
				url: '/api/settings/'+self.key(),
				data: {
					value: self.value()
				},
				success: function (data) {
					self.value(data.value);
				},
				error: function (xhr) {
					alert('Something went wrong: '+xhr.status);
				}
			});
			return;
		}

		rvm.vmpool.settings.prompt.show(self.toJson(), function (value) {
			$.ajax({
				type: 'put',
				url: '/api/settings/'+self.key(),
				data: {
					value: value
				},
				success: function (data) {
					self.value(value);
				},
				error: function (xhr) {
					alert('Something went wrong: '+xhr.status);
				}
			});
		});
	};

	self.toJson = function () {
		return {
			template    : self.template(),
			key         : self.key(),
			humanKey    : self.humanKey(),
			description : self.description(),
			enabled     : self.enabled(),
			value       : self.value(),
			options     : self.options()
		};
	};
}

function PromptViewModel() {
	var self = this;

	self.title       = ko.observable('');
	self.description = ko.observable('');
	self.value       = ko.observable('');
	self.widget      = ko.observable('int-template-widget');
	self.options     = ko.observableArray([]);

	self.show = function (options, save_callback) {
		self.title(options.humanKey);
		self.description(options.description);
		self.value(options.value);
		self.widget(options.template+'-widget');
		self.options(options.options || []);
		self.save_callback = save_callback;

		setTimeout(function () {
			$("#prompt-modal").modal('show');
		}, 1);
	};

	self.save = function (vm, event) {
		if (typeof self.save_callback == 'function') {
			self.save_callback(self.value());
		}
		$("#prompt-modal").modal('hide');
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

	self.reset = function (vm, event) {
		var ladda = $(event.target).ladda();

		ladda.ladda('start');

		$.ajax({
			type: 'delete',
			url: '/api/settings',
			success: function () {
				self.load(function () {
					ladda.ladda('stop');
				});
			},
			error: function (xhr) {
				alert('Something went wrong: '+xhr.status);
			}
		});
	};

	self.prompt = new PromptViewModel();
}

