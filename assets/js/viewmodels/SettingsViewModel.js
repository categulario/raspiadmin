function SettingsViewModel() {
	var self = this;

	self.template = ko.observable('settings-template');
	self.title    = ko.observable('Settings');

	self.load = function (done) {
		$.get({
			url: '/api/settings',
			success: function (data) {
				console.log(data);
			},
			error: function (xhr) {
				alert('Something went wrong: '+xhr.status);
			}
		});
		done();
	};
}
