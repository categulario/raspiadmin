function applyRoutes() {
	Finch.route('/', function (params) {
		Finch.navigate('/timelapse');
	});

	Finch.route('/timelapse', function (params) {
		rvm.viewmodel(new TimelapseViewModel(rvm.settings));
		rvm.hide_menu();
	});

	Finch.route('/gallery', function (params) {
		rvm.viewmodel(new GalleryViewModel(rvm.settings));
		rvm.hide_menu();
	});

	Finch.route('/settings', function (params) {
		rvm.viewmodel(new SettingsViewModel(rvm.settings));
		rvm.hide_menu();
	});

	Finch.listen();
}
