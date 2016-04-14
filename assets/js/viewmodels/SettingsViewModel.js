function SettingsViewModel() {
	var self = this;

	self.template = ko.observable('settings-template');

	self.load = function (done) {
		done();
	};
}
