(function (jOuery, Symphony, require) {

	var oldJquery = jQuery; // cache the original Symphony jQuery instance and re-add it later

	require([
		'jquery',
		'underscore',
		'backbone',
		'views/view_upload',
		'views/view_directories',
		'views/view_select',
		'modules/mod_sysmessage',
		'jqueryui',
		'plugins/jquery-event-destroyed'
	], function ($17, _, Backbone, UploadView, TreeView, SelectView, SysMessage) {

		var $, listings_base, upload_base, CoreSettings, mod;

		window.jQuery = oldJquery;
		oldJquery = null;
		$17.noConflict();
		Backbone.noConflict();
		_.noConflict();
		$ = $17;

		Backbone.emulateHTTP = true;

		listings_base = Symphony.Context.get('root') + '/symphony/extension/filemanager/settings/';
		upload_base = Symphony.Context.get('root') + '/symphony/extension/filemanager/upload/';

		CoreSettings = Backbone.Model.extend({
			url: listings_base,
			initialize: function () {
				this.deferred = this.fetch({
					data: {
						'field_id': $('#filemanager').find('input[name="fields[field_id]"]').val()
					}
				});
			}
		});


		// DOMREADY
		// ==================================================================
		$(function () {
			var form = $('form'),
			container = $('#filemanager-container'),
			wrapper = $('#filemanager'),
			max_size = parseInt($('input[name=MAX_FILE_SIZE]').val(), 10);

			mod = new CoreSettings();

			wrapper.addClass('loading');



			form.submit(function () {
				$(window).off('beforeunload');
			});
			// this will never work;
			function submitForm() {
				var formData = form.serialize();
				$.ajax({type: 'POST', url: form.attr('action'), data: formData});
			}



			mod.deferred.done(function (settings) {
				//	console.log(settings, 'settings');
				var fileSettings = {},
				dirSettings = {},
				upload,
				selectContainer = $('#filemanager-files-select-container'),
				//fieldname = selectContainer.find('input[name=fieldname]').val();
				fieldname = settings.element_name,

				dirTreeView = new TreeView({
					el: '#filemanager-dir-listing-body',
					tagName: 'ul',
					className: 'root-dir dir',
					dirSettings: dirSettings,
					fileSettings: fileSettings,
					field_id: settings.field_id,
					baseName: settings.element_name //the field name we are postign to
				}),

				selectView = new SelectView({
					dirtree: dirTreeView,
					el: selectContainer.find('ul').get(0),
					fieldname: fieldname
				});

				_.each(settings, function (val, key) {
					if (key.match(/^allow_file_.*/)) {
						fileSettings[key] = val;
					}
					if (key.match(/^allow_dir_.*/)) {
						dirSettings[key] = val;
					}
				});


				if (settings.allow_dir_move) {
					dirTreeView.$el.addClass('draggable');
				}

				if (settings.limit_files) {
					selectView.collection.addSetting('limit', parseInt(settings.limit_files, 10));
				}


				if (settings.allow_dir_upload_files) {

					upload = new UploadView({
						el: '#filemanager-fileupload',
						field_id: settings.field_id
					});

					upload.collection.addSetting('allowed_types', new RegExp(settings.allowed_types), true);
					upload.collection.addSetting('max_file_size', settings.max_upload_size || max_size);
					upload.collection.addSetting('field_id', settings.field_id);
					upload.collection.url = upload_base;

					upload.on('uploadcreate', _.bind(dirTreeView.disableTask, dirTreeView, 'upload'));
					upload.on('uploaddestroy', _.bind(dirTreeView.enableTask, dirTreeView, 'upload'));
					upload.on('fileuploaded', _.bind(dirTreeView.collection.updateDir, dirTreeView.collection));

					// trigger an upload creation
					dirTreeView
						.on('upload', _.bind(upload.createUpload, upload))
						.on('toggle', function () {
						//dirs._setSchemeState, dirs)
					});
				}
				//selectView.collection.on('add', function (model) {
				//	console.log('ADDING: ', model);
				//});
				window.selectView = selectView;
				window.dirTreeView = dirTreeView;
				dirTreeView.on('update', function () {
					// wait until collection is fully pupulated
					// TODO; fix add deferred to handle this instead of
					// a timeout
					setTimeout(function () {
						var paths = selectView.collection.pluck('path'),
						files = dirTreeView.collection.getByFileName(paths),
						fids = _.pluck(files, 'id');
						dirTreeView.selectById(fids);

						//console.log(files);
						//console.log(fids);

						// also update file ids on selectview collection
						selectView.collection.each(function (file) {
							var f = dirTreeView.collection.getByFileName(file.get('path'));
							f = f[0];
							if (f) {
								file.set('id', f.id);
								file.id = f.id;
							}
						});
						selectView.render();
					}, 0);
				});
				selectView.on('prepoulate', _.bind(dirTreeView.selectById, dirTreeView));
				selectView.on('removedselected', _.bind(dirTreeView.unselectById, dirTreeView));
				selectView.collection.on('selectionlimitexceed', _.bind(dirTreeView.unselectById, dirTreeView));

				wrapper.removeClass('loading');
				container.slideDown();

				$(window).on('beforeunload', function () {

					if (selectView.collection.hasChanges()) {
						submitForm();
						form.submit();
						return Symphony.Language.get(SysMessage.unsaved_changes);
					}
				});

			});
		});

	});

} (this.jQuery, this.Symphony, this.require));
