function Picture(src) {
	var self = this;

	self.src = ko.observable('/cam/'+src);

	self.show = function (vm, event) {
		$('#img-modal-img')[0].src = self.src();
		$('#download-pic')[0].href = self.src();
		$('#download-pic')[0].download = src;

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

	self.deletePic = function (vm, event) {
		if (!confirm('Are you shure you want to delete this photo?')) {
			return;
		}

		var pieces = $('#img-modal-img')[0].src.split('/');
		var ladda = $(event.target).ladda();

		ladda.ladda('start');

		$.ajax({
			type: 'delete',
			url: '/api/gallery/'+pieces[pieces.length-1],
			success: function () {
				self.pictures().filter(function (pic) {
					return pic.src() == '/cam/'+pieces[pieces.length-1];
				}).forEach(function (item) {
					self.pictures.remove(item);
				});
				ladda.ladda('stop');
				setTimeout(function () {
					$('#img-modal').modal('hide');
				}, 1);
			},
			error: function (xhr) {
				alert('Something went wrong: '+shr.status_code);
				ladda.ladda('stop');
			}
		});
	};
}
