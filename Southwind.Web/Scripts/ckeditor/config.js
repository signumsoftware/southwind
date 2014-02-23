/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.config.allowedContent = true;
CKEDITOR.config.autoParagraph = false;

CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    config.uiColor = '#FAFAFA';

    config.toolbar = 'MyToolbar';
    config.scayt_autoStartup = true;

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

    config.height = '500px';
};


