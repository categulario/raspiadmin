ko.bindingHandlers.boolval = {
	init: function () {},
	update: function (element, valueAccessor) {
		var value = ko.unwrap(valueAccessor());

		if (value) {
			$(element).html('<i class="fa fa-check"></i>');
		} else {
			$(element).html('<i class="fa fa-times"></i>');
		}
	}
}
