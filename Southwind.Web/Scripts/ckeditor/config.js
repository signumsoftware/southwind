/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
    config.uiColor = '#FAFAFA';

    config.toolbar = 'MyToolbar';

    config.toolbar_MyToolbar =
	[
		{ name: 'document', items: ['Source'] },
		{ name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
		{ name: 'editing', items: ['SelectAll', '-', 'Scayt'] },
		{ name: 'insert', items: ['Link', 'Unlink', 'Image', 'Table', 'HorizontalRule', 'SpecialChar'] }, 
        '/',
		{ name: 'styles', items: ['Format', 'Font', 'FontSize'] },
		{ name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', '-', 'RemoveFormat'] },
		{ name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote'] },
		{ name: 'tools', items: ['Preview', '-', 'Maximize'] }
	];
};
