function applyRoutes() {
	Finch.route('/', function (params) {
		Finch.navigate('/timelapse');
	});

	Finch.route('/:section', function (params) {
		var vm = rvm.vmpool[params.section];

		vm.load(function () {
			rvm.viewmodel(vm);
		});

		rvm.hide_menu();
	});

	Finch.listen();
}
