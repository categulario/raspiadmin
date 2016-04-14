function Picture(src) {
	var self = this;

	self.src = ko.observable('/cam/'+src);

	self.show = function (vm, event) {
		$('#img-modal-img')[0].src = self.src();

		setTimeout(function () {
			$('#img-modal').modal('show');
		});
	};
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
