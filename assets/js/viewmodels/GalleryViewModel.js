function GalleryViewModel() {
	var self = this;

	self.template = ko.observable('gallery-template');

	self.load = function (done) {
		done();
	};
}
