function applyRoutes() {
	Finch.route('/', function (params) {
		Finch.navigate('/timelapse');
	});

	Finch.route('/:section', function (params) {
		var vm = rvm.vmpool[params.section];

		// load loading until ready
		rvm.viewmodel(rvm.vmpool.loading);

		vm.load(function () {
			rvm.viewmodel(vm);
		});

		rvm.hide_menu();
	});

	Finch.listen();
}
