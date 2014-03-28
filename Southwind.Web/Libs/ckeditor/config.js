/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.config.allowedContent = true;
CKEDITOR.config.autoParagraph = false;

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	
	config.uiColor = '#FAFAFA';

    config.toolbar = 'MyToolbar';

    config.scayt_autoStartup = true;

    config.toolbar_MyToolbar =
	[
		{ name: 'document', items: ['Source'] },
		{ name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
		{ name: 'editing', items: ['SelectAll', '-', 'Scayt'] },
		{ name: 'insert', items: ['Link', 'Unlink', /*'Image', 'addFile', */'addImage', 'Table', 'HorizontalRule', 'SpecialChar'] },
        { name: 'tools', items: ['Preview', '-', 'Maximize'] },
        '/',
		{ name: 'styles', items: ['Format', 'Font', 'FontSize'] },
		{ name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', '-', 'RemoveFormat'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
		{ name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote'] },
		
	];

    // our file uploader
    var uploadUrl = '/fckeditor/editor/filemanager/connectors/php/upload.php';
    config.filebrowserUploadUrl = uploadUrl + '?Type=File';
    config.filebrowserImageUploadUrl = uploadUrl + '?Type=Image';

    // Add the plugin!!!
    config.extraPlugins = 'simpleuploads';

    // Restrict uploads to the extensions that are allowed in this file uploader
    config.simpleuploads_acceptedExtensions = '7z|avi|csv|doc|docx|flv|gif|gz|gzip|jpeg|jpg|mov|mp3|mp4|mpc|mpeg|mpg|ods|odt|pdf|png|ppt|pxd|rar|rtf|tar|tgz|txt|vsd|wav|wma|wmv|xls|xml|zip';

    // we want the demo text to look better even if the buttons aren't included
    config.extraAllowedContent = "h3 blockquote ul li";

    config.height = '500px';
	
};
