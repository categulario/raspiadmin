function Picture(src) {
	var self = this;

	self.src = ko.observable('/cam/'+src);
}

function GalleryViewModel() {
	var self = this;

	self.template = ko.observable('gallery-template');
	self.pictures = ko.observableArray([]);

	self.load = function (done) {
		$.get({
			url: '/api/gallery',
			success: function (data) {
				self.pictures(data.pictures.map(function (pic) {
					return new Picture(pic);
				}));
				done();
			},
			error: function (data) {
				console.log(data);
				done();
			}
		})
	};
}
