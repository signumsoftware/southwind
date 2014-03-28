/**
 * @file SimpleUploads plugin for CKEditor
 *	Uploads pasted images and files inside the editor to the server for Firefox and Chrome
 *	Feature introduced in: https://bugzilla.mozilla.org/show_bug.cgi?id=490879
 *		doesn't include images inside HTML (paste from word). IE11 does.
				https://bugzilla.mozilla.org/show_bug.cgi?id=665341
				https://www.libreoffice.org/bugzilla/show_bug.cgi?id=72083

 * Includes Drag&Drop file uploads for all the new browsers.
 * Two toolbar buttons to perform quick upload of files.
 * Copyright (C) 2012-13 Alfonso Martínez de Lizarrondo
 *
improvements: allow d&d between 2 editors in Firefox
https://bugzilla.mozilla.org/show_bug.cgi?id=454832

 */

(function () {
    "use strict";

    var counter = 0;
    function getTimeStampId() {
        counter++;
        return (new Date()).toJSON().replace(/:|T|-/g, "_").replace(/\..*/, "") + counter;
    }

    // Custom rule similar to the fake Object to avoid generating anything if the user tries to do something strange while a file is being uploaded
    var htmlFilterRules = {
        elements: {
            $: function (element) {
                var attributes = element.attributes,
                    className = attributes && attributes["class"];

                // remove our wrappers
                if (className == "SimpleUploadsTmpWrapper")
                    return false;
            }
        }
    };

    // CSS that we add to the editor for our internal styling
    function getEditorCss(config) {
        var imgUpload = 'span.SimpleUploadsTmpWrapper>span { top: 50%; margin-top: -0.5em; width: 100%; text-align: center; color: #fff; ' +
            'text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-size: 50px; font-family: Calibri,Arial,Sans-serif; pointer-events: none; ' +
            'position: absolute; display: inline-block;}';
        if (config.simpleuploads_hideImageProgress)
            imgUpload = 'span.SimpleUploadsTmpWrapper { color:#333; background-color:#fff; padding:4px; border:1px solid #EEE;}';

        return '.SimpleUploadsOverEditor { ' + (config.simpleuploads_editorover || 'box-shadow: 0 0 10px 1px #999999 inset !important;') + ' }' +
            'a.SimpleUploadsTmpWrapper { color:#333; background-color:#fff; padding:4px; border:1px solid #EEE;}' +
            '.SimpleUploadsTmpWrapper { display: inline-block; position: relative; pointer-events: none;}' +
            imgUpload +
            '.uploadRect {display: inline-block;height: 0.9em;vertical-align: middle;width: 20px;}' +
            '.uploadRect span {background-color: #999;display: inline-block;height: 100%;vertical-align: top;}' +
            '.SimpleUploadsTmpWrapper .uploadCancel { background-color: #333333;border-radius: 0.5em;color: #FFFFFF;cursor: pointer !important;' +
                'display: inline-block;height: 1em;line-height: 0.8em;margin-left: 4px;padding-left: 0.18em;pointer-events: auto;' +
                'position: relative; text-decoration:none; top: -2px;width: 0.7em;}' +
            '.SimpleUploadsTmpWrapper span uploadCancel { width:1em; padding-left:0}';
    }

    var filePicker,
        filePickerEditor,
        filePickerForceLink;

    var IEUpload_fileName,
        IEUpload_caller,
        IEUpload_callback;

    function PickAndUploadFile(editor, forImage, caller, callback) {
        if (IEUpload_fileName) {
            alert("Please, wait to finish the current upload");
            return;
        }

        filePickerForceLink = !forImage;
        filePickerEditor = editor;

        if (typeof FormData == 'undefined') {
            // old IE
            var iframe = document.getElementById("simpleUploadsTarget");
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.id = "simpleUploadsTarget";
                document.body.appendChild(iframe);
            }
            IEUpload_caller = caller;
            IEUpload_callback = callback;

            var fnNumber = editor._.simpleuploadsFormUploadFn;
            var fnInitPicker = editor._.simpleuploadsFormInitFn;
            if (!fnNumber) {
                editor._.simpleuploadsFormUploadFn = fnNumber = CKEDITOR.tools.addFunction(setUrl, editor);
                editor._.simpleuploadsFormInitFn = fnInitPicker = CKEDITOR.tools.addFunction(function () {
                    window.setTimeout(function () {
                        var picker = document.getElementById("simpleUploadsTarget").contentWindow.document.getElementById("upload");
                        picker.onchange = function () {
                            var evdata = {
                                name: this.value,
                                url: this.form.action,
                                context: IEUpload_caller,
                                id: 'IEUpload'
                            };
                            // Remove C:\FakePath\
                            var m = evdata.name.match(/\\([^\\]*)$/);
                            if (m)
                                evdata.name = m[1];

                            var result = filePickerEditor.fire("simpleuploads.startUpload", evdata);
                            // in v3 cancel() returns true and in v4 returns false
                            // if not canceled it's the evdata object
                            if (typeof result == "boolean")
                                return;

                            if (IEUpload_callback && IEUpload_callback.start)
                                IEUpload_callback.start(evdata);

                            IEUpload_fileName = this.value;
                            this.form.action = evdata.url;

                            // Add extra fields if provided
                            if (evdata.extraFields) {
                                var obj = evdata.extraFields;
                                var doc = this.ownerDocument;
                                for (var prop in obj) {
                                    if (obj.hasOwnProperty(prop)) {
                                        var field = doc.createElement("input");
                                        field.type = "hidden";
                                        field.name = prop;
                                        field.value = obj[prop];
                                        this.form.appendChild(field);
                                    }
                                }
                            }

                            this.form.submit();
                        };
                        picker.click();
                    }, 100);
                }, editor);

                editor.on("destroy", function () {
                    CKEDITOR.tools.removeFunction(this._.simpleuploadsFormUploadFn);
                    CKEDITOR.tools.removeFunction(this._.simpleuploadsFormInitFn);
                });
            }

            var form = "<form method='post' enctype='multipart/form-data' action='" + getUploadUrl(editor, fnNumber, forImage) + "'>" +
            "<input type='file' name='upload' id='upload'></form>";
            var src = 'document.open(); document.write("' + form + '");document.close();' +
                    'window.parent.CKEDITOR.tools.callFunction(' + fnInitPicker + ');';

            iframe.src = 'javascript:void(function(){' + encodeURIComponent(src) + '}())';

            // Detect when the file upload ends to check for errors
            iframe.onreadystatechange = function () {
                if (iframe.readyState == "complete") {
                    window.setTimeout(function () {
                        if (IEUpload_fileName) {
                            alert("The file upload has failed");
                            IEUpload_fileName = null;
                        }
                    }, 100);
                }
            };

            filePicker = null;
            return;
        }

        var data = {
            context: caller,
            callback: callback
        };

        if (!filePicker) {
            filePicker = document.createElement("input");
            filePicker.type = "file";
            filePicker.style.overflow = "hidden";
            filePicker.style.width = "1px";
            filePicker.style.height = "1px";
            filePicker.style.opacity = 0.1;
            filePicker.multiple = "multiple";

            document.body.appendChild(filePicker);
            filePicker.addEventListener("change", function () {
                var count = filePicker.files.length;
                if (!count)
                    return;

                // Create Undo image
                filePickerEditor.fire("saveSnapshot");

                for (var i = 0; i < count; i++) {
                    var file = filePicker.files[i],
                        evData = CKEDITOR.tools.extend({}, filePicker.simpleUploadData);

                    evData.file = file;
                    evData.name = file.name;
                    evData.id = getTimeStampId();

                    if (!evData.callback)
                        createPreview(evData, filePickerEditor, filePickerForceLink);

                    // Upload the file
                    if (uploadFile(filePickerEditor, filePickerForceLink, evData)) {
                        var element = evData.element;
                        if (!element)
                            continue;

                        if (count == 1) {
                            var selection = filePickerEditor.getSelection(),
                                selected = selection.getSelectedElement(),
                                originalNode;

                            // If it's just one image and the user has another one selected, replace it
                            if (selected && selected.getName() == "img" && element.getName() == "span") {
                                originalNode = selected.$;
                            }

                            // a link
                            if (element.getName() == "a") {
                                var parent = selected;
                                var ranges = selection.getRanges(),
                                    range = ranges && ranges[0];

                                if (!parent) {
                                    if (ranges && ranges.length == 1) {
                                        parent = range.startContainer.$;
                                        if (parent.nodeType == document.TEXT_NODE)
                                            parent = parent.parentNode;
                                    }
                                }

                                while (parent && (parent.nodeType == document.ELEMENT_NODE) && (parent.nodeName.toLowerCase() != "a"))
                                    parent = parent.parentNode;

                                if (parent && parent.nodeName && parent.nodeName.toLowerCase() == "a") {
                                    originalNode = parent;
                                }
                                // there was no link, check the best way to create one:

                                // create a link
                                if (!originalNode && range && (selected || !range.collapsed)) {
                                    var style = new CKEDITOR.style({ element: 'a', attributes: { href: '#' } });
                                    style.type = CKEDITOR.STYLE_INLINE; // need to override... dunno why.
                                    style.applyToRange(range);

                                    parent = range.startContainer.$;
                                    if (parent.nodeType == document.TEXT_NODE)
                                        parent = parent.parentNode;

                                    originalNode = parent;
                                }
                            }

                            if (originalNode) {
                                originalNode.parentNode.replaceChild(element.$, originalNode);
                                evData.originalNode = originalNode;
                                filePickerEditor.fire("saveSnapshot");
                                return;
                            }
                        }

                        // insert a space between links
                        if (i > 0 && element.getName() == "a")
                            filePickerEditor.insertHtml("&nbsp;");

                        filePickerEditor.insertElement(element);
                    }
                }
            });
        }

        filePicker.value = '';
        filePicker.simpleUploadData = data;
        filePicker.click();
    }

    function getUploadUrl(editor, functionNumber, forImage) {
        var params = {};
        params.CKEditor = editor.name;
        params.CKEditorFuncNum = functionNumber;
        params.langCode = editor.langCode;

        var url = forImage ? editor.config.filebrowserImageUploadUrl : editor.config.filebrowserUploadUrl;
        return addQueryString(url, params);
    }

    function setUrl(fileUrl, msg) {
        // The "msg" argument may be used to pass the error message to the editor.
        if (typeof msg == "string" && msg && !fileUrl)
            alert(msg);

        var editor = filePickerEditor;
        editor.fire('simpleuploads.endUpload', { name: IEUpload_fileName, ok: (!!fileUrl) });

        if (IEUpload_callback) {
            IEUpload_callback.upload(fileUrl, msg, { context: IEUpload_caller });
            IEUpload_fileName = null;
            IEUpload_callback = null;
            IEUpload_caller = null;
            return;
        }

        if (fileUrl) {
            var element,
				attribute;
            if (filePickerForceLink) {
                element = new CKEDITOR.dom.element("a", editor.document);
                element.setText(fileUrl.match(/\/([^\/]+)$/)[1]);
                attribute = "href";
            }
            else {
                element = new CKEDITOR.dom.element("img", editor.document);
                attribute = "src";

                element.on("load", function (e) {
                    e.removeListener();
                    element.removeListener("error", errorListener);

                    element.setAttribute("width", element.$.width);
                    element.setAttribute("height", element.$.height);

                    editor.fire('simpleuploads.finishedUpload', { name: IEUpload_fileName, element: element });
                });

                element.on("error", errorListener, null, element);
            }
            element.setAttribute(attribute, fileUrl);
            element.data("cke-saved-" + attribute, fileUrl);
            editor.insertElement(element);

            if (filePickerForceLink)
                filePickerEditor.fire("simpleuploads.finishedUpload", { name: IEUpload_fileName, element: element });
        }

        IEUpload_fileName = null;
        IEUpload_caller = null;
    }

    /*
	* Adds (additional) arguments to given url.
	*
	* @param {String}
	*	url The url.
	* @param {Object}
	*	params Additional parameters.
	*/
    function addQueryString(url, params) {
        var queryString = [];

        if (!params)
            return url;
        else {
            for (var i in params)
                queryString.push(i + "=" + encodeURIComponent(params[i]));
        }

        return url + ((url.indexOf("?") != -1) ? "&" : "?") + queryString.join("&");
    }


    var addFileCmd = {
        exec: function (editor) {
            PickAndUploadFile(editor, false, this);
        }
    };

    var addImageCmd = {
        exec: function (editor) {
            PickAndUploadFile(editor, true, this);
        }
    };


    function hasFiles(e) {
        var ev = e.data.$,
            data = ev.dataTransfer;

        if (!data || !data.types)
            return false;

        if (data.types.contains && data.types.contains("Files") && (!data.types.contains("text/html"))) return true;
        if (data.types.indexOf && data.types.indexOf("Files") != -1) return true;
        return false;
    }

    CKEDITOR.plugins.add("simpleuploads",
    {
        //lang : 'en,es',		v4 style for builder not compatible with v3
        lang: ['en', 'de', 'es', 'pl'], // "en" the first one to use it as default
        icons: 'addfile,addimage', // %REMOVE_LINE_CORE%

        onLoad: function () {
            // v4
            // In v4 this setting is global for all instances:
            if (CKEDITOR.addCss)
                CKEDITOR.addCss(getEditorCss(CKEDITOR.config));

            // CSS for container
            var node = CKEDITOR.document.getHead().append('style');
            node.setAttribute('type', 'text/css');
            var content = '.SimpleUploadsOverContainer {' + (CKEDITOR.config.simpleuploads_containerover || 'box-shadow: 0 0 10px 1px #99DD99 !important;') + '} ' +
                        '.SimpleUploadsOverDialog {' + (CKEDITOR.config.simpleuploads_dialogover || 'box-shadow: 0 0 10px 4px #999999 inset !important;') + '} ' +
                        '.SimpleUploadsOverCover {' + (CKEDITOR.config.simpleuploads_coverover || 'box-shadow: 0 0 10px 4px #99DD99 !important;') + '} ';

            // Inject the throbber styles in the page:
            // If this were part of the official code it should be placed in the dialog.css skin
            // We must specify the .cke_throbber for the inner divs or the reset css won't allow to use the background-color
            content += [".cke_throbber {margin: 0 auto; width: 100px;}",
                        ".cke_throbber div {float: left; width: 8px; height: 9px; margin-left: 2px; margin-right: 2px; font-size: 1px;}",
                        ".cke_throbber .cke_throbber_1 {background-color: #737357;}",
                        ".cke_throbber .cke_throbber_2 {background-color: #8f8f73;}",
                        ".cke_throbber .cke_throbber_3 {background-color: #abab8f;}",
                        ".cke_throbber .cke_throbber_4 {background-color: #c7c7ab;}",
                        ".cke_throbber .cke_throbber_5 {background-color: #e3e3c7;}",
                        ".uploadRect {display: inline-block;height: 11px;vertical-align: middle;width: 50px;}",
                        ".uploadRect span {background-color: #999;display: inline-block;height: 100%;vertical-align: top;}",
                        ".uploadName {display: inline-block;max-width: 180px;overflow: hidden;text-overflow: ellipsis;vertical-align: top;white-space: pre;}",
                        ".uploadText {font-size:80%;}",
                        ".cke_throbberMain a {cursor: pointer; font-size: 14px; font-weight:bold; padding: 4px 5px;position: absolute;right:0; text-decoration:none; top: -2px;}",
                        ".cke_throbberMain {background-color: #FFF; border:1px solid #e5e5e5; padding:4px 14px 4px 4px; min-width:250px; position:absolute;}"]
                        .join(' ');

            if (CKEDITOR.env.ie && CKEDITOR.env.version < 11)
                node.$.styleSheet.cssText = content;
            else
                node.$.innerHTML = content;
        },

        init: function (editor) {
            var imageExtensions = editor.config.simpleuploads_imageExtensions || "jpe?g|gif|png";
            editor.config.simpleuploads_imageRegexp = new RegExp("\.(?:" + imageExtensions + ")$", "i");

            // v3
            if (editor.addCss)
                editor.addCss(getEditorCss(editor.config));

            // if not defined specifically for images, reuse the default file upload url
            if (!editor.config.filebrowserImageUploadUrl)
                editor.config.filebrowserImageUploadUrl = editor.config.filebrowserUploadUrl;

            if (!editor.config.filebrowserUploadUrl && !editor.config.filebrowserImageUploadUrl) {
                if (window.console && console.log) {
                    console.log("The editor is missing the 'config.filebrowserUploadUrl' entry to know the url that will handle uploaded files.\r\n" +
                        "It should handle the posted file as shown in Example 3: http://docs.cksource.com/CKEditor_3.x/Developers_Guide/File_Browser_%28Uploader%29/Custom_File_Browser#Example_3\r\n" +
                        "More info: http://alfonsoml.blogspot.com/2009/12/using-your-own-uploader-in-ckeditor.html");
                    console[console.warn ? "warn" : "log"]("The 'SimpleUploads' plugin now is disabled.");
                }
                return;
            }

            // v 4.1 filters
            if (editor.addFeature) {
                editor.addFeature({
                    allowedContent: 'img[!src,width,height];a[!href];span[id](SimpleUploadsTmpWrapper);'
                });
            }

            // Manages the throbber animation that appears to show a lengthy operation
            CKEDITOR.dialog.prototype.showThrobber = function () {
                if (!this.throbber) {
                    this.throbber = {
                        update: function () {
                            var throbberParent = this.throbberParent.$,
                                throbberBlocks = throbberParent.childNodes,
                                lastClass = throbberParent.lastChild.className;

                            // From the last to the second one, copy the class from the previous one.
                            for (var i = throbberBlocks.length - 1 ; i > 0 ; i--)
                                throbberBlocks[i].className = throbberBlocks[i - 1].className;

                            // For the first one, copy the last class (rotation).
                            throbberBlocks[0].className = lastClass;
                        },

                        create: function (dialog) {
                            if (this.throbberCover)
                                return;

                            var cover = CKEDITOR.dom.element.createFromHtml('<div style="background-color:rgba(255,255,255,0.95);width:100%;height:100%;top:0;left:0; position:absolute; visibility:none;z-index:100;"></div>');
                            dialog.parts.close.setStyle("z-index", 101);
                            // IE8
                            if (CKEDITOR.env.ie && CKEDITOR.env.version < 9) {
                                cover.setStyle("zoom", 1);
                                cover.setStyle("filter", "progid:DXImageTransform.Microsoft.gradient(startColorstr=#EEFFFFFF,endColorstr=#EEFFFFFF)");
                            }

                            cover.appendTo(dialog.parts.dialog);
                            this.throbberCover = cover;
                            //dialog.throbberCover = cover;

                            var mainThrobber = new CKEDITOR.dom.element("div");
                            this.mainThrobber = mainThrobber;
                            var throbberParent = new CKEDITOR.dom.element("div");
                            this.throbberParent = throbberParent;
                            var throbberTitle = new CKEDITOR.dom.element("div");
                            this.throbberTitle = throbberTitle;
                            cover.append(mainThrobber).addClass("cke_throbberMain");
                            mainThrobber.append(throbberTitle).addClass("cke_throbberTitle");
                            mainThrobber.append(throbberParent).addClass("cke_throbber");

                            // Create the throbber blocks.
                            var classIds = [1, 2, 3, 4, 5, 4, 3, 2];
                            while (classIds.length > 0)
                                throbberParent.append(new CKEDITOR.dom.element("div")).addClass('cke_throbber_' + classIds.shift());

                            this.center();

                            // Protection if the dialog is closed without removing the throbber
                            dialog.on("hide", this.hide, this);
                        },
                        center: function () {
                            var mainThrobber = this.mainThrobber,
                                cover = this.throbberCover;
                            // Center the throbber
                            var x = (cover.$.offsetWidth - mainThrobber.$.offsetWidth) / 2,
                                y = (cover.$.offsetHeight - mainThrobber.$.offsetHeight) / 2;
                            mainThrobber.setStyle("left", x.toFixed() + "px");
                            mainThrobber.setStyle("top", y.toFixed() + "px");
                        },
                        show: function () {
                            this.create(CKEDITOR.dialog.getCurrent());

                            this.throbberCover.setStyle("visibility", "");

                            // Setup the animation interval.
                            this.timer = setInterval(CKEDITOR.tools.bind(this.update, this), 100);
                        },
                        hide: function () {
                            if (this.timer) {
                                clearInterval(this.timer);
                                this.timer = null;
                            }

                            if (!this.throbberCover)
                                return;

                            this.throbberCover.setStyle("visibility", "hidden");
                        }
                    };
                }
                this.throbber.show();
            };

            // Add a listener to check file size and valid extensions
            editor.on("simpleuploads.startUpload", function (ev) {
                var file = ev.data && ev.data.file;
                if (editor.config.simpleuploads_maxFileSize &&
                    file && file.size &&
                    file.size > editor.config.simpleuploads_maxFileSize) {
                    alert(editor.lang.simpleuploads.fileTooBig);
                    ev.cancel();
                }
                var name = ev.data.name;
                if (editor.config.simpleuploads_invalidExtensions) {
                    var reInvalid = new RegExp("\.(?:" + editor.config.simpleuploads_invalidExtensions + ")$", "i");
                    if (reInvalid.test(name)) {
                        alert(editor.lang.simpleuploads.invalidExtension);
                        ev.cancel();
                    }
                }
                if (editor.config.simpleuploads_acceptedExtensions) {
                    var reAccepted = new RegExp("\.(?:" + editor.config.simpleuploads_acceptedExtensions + ")$", "i");
                    if (!reAccepted.test(name)) {
                        alert(editor.lang.simpleuploads.nonAcceptedExtension.replace("%0", editor.config.simpleuploads_acceptedExtensions));
                        ev.cancel();
                    }
                }
            });

            // workaround for image2 support
            editor.on('simpleuploads.finishedUpload', function (ev) {
                if (editor.widgets && editor.plugins.image2) {
                    var element = ev.data.element;
                    if (element.getName() == "img") {
                        var widget = editor.widgets.getByElement(element);
                        if (widget) {
                            widget.data.src = element.data('cke-saved-src');
                            widget.data.width = element.$.width;
                            widget.data.height = element.$.height;
                        }
                        else
                            editor.widgets.initOn(element, "image2");
                    }
                }
            });

            // Paste from clipboard:
            editor.on("paste", function (e) {
                var pasteData = e.data,
                    html = (pasteData.html || (pasteData.type && pasteData.type == 'html' && pasteData.dataValue));

                if (!html)
                    return;

                // strip out webkit-fake-url as they are useless:
                if (CKEDITOR.env.webkit && (html.indexOf("webkit-fake-url") > 0)) {
                    alert("Sorry, the images pasted with Safari aren't usable");
                    window.open("https://bugs.webkit.org/show_bug.cgi?id=49141");
                    html = html.replace(/<img src="webkit-fake-url:.*?">/g, "");
                }

                // Handles image pasting in Firefox
                // Replace data: images in Firefox and upload them.
                // No longer required with Firefox 22
                html = html.replace(/<img(.*?) src="data:image\/.{3,4};base64,.*?"(.*?)>/g, function (img) {
                    if (!editor.config.filebrowserImageUploadUrl)
                        return "";

                    var match = img.match(/"(data:image\/(.{3,4});base64,.*?)"/),
						imgData = match[1],
						type = match[2].toLowerCase(),
						id = getTimeStampId();

                    // If it's too small then leave it as is.
                    if (imgData.length < 128)
                        return img;

                    if (type == "jpeg")
                        type = "jpg";

                    var fileName = id + '.' + type;
					
                    var byteString = window.atob(imgData.split(',')[1]);
                    var mimeString = imgData.split(',')[0].split(':')[1].split(';')[0];

                    var array = [];
                    for (var i = 0; i < byteString.length; i++) array.push(byteString.charCodeAt(i));

                    var blob = new Blob([new Uint8Array(array)], { type: mimeString });

                    var uploadData = {
                        context: "pastedimage",
                        name: fileName,
                        id: id,
                        file: blob
                    };

                    createXHRupload(editor, false, uploadData);

                    var animation = createSVGAnimation(imgData, id, editor),
						content = animation.$.innerHTML;
                    animation.$.innerHTML = "&nbsp;";

                    editor.on("afterPaste", function (ev) {
                        // only once
                        ev.removeListener();

                        var span = editor.document.$.getElementById(id);
                        if (!span)
                            return;

                        // fight against ACF in v4.1 and IE11, insert svg afterwards
                        span.innerHTML = content;
                        setupCancelButton(editor, uploadData);
                    });

                    return animation.getOuterHtml();
                });

                if (e.data.html)
                    e.data.html = html;
                else
                    e.data.dataValue = html;
            });

            var avoidBadUndo = function (e) {
                if (editor.mode != "wysiwyg")
                    return;

                var root = editor.document;
                if (editor.editable)
                    root = editor.editable();

                // detect now if the contents include our tmp node
                if (root.$.querySelector(".SimpleUploadsTmpWrapper")) {
                    var move = e.name.substr(5).toLowerCase();

                    // If the user tried to redo but there are no more saved images forward and this is a bad image, move back instead.
                    if (move == "redo" && editor.getCommand(move).state == CKEDITOR.TRISTATE_DISABLED)
                        move = "undo";

                    // Move one extra step back/forward
                    editor.execCommand(move);
                }
            };
            // on dev mode plugins might not load in the right order with empty cache
            var cmd = editor.getCommand('undo');
            cmd && cmd.on('afterUndo', avoidBadUndo);
            cmd = editor.getCommand('redo');
            cmd && editor.getCommand('redo').on('afterRedo', avoidBadUndo);
            // http://dev.ckeditor.com/ticket/10101
            editor.on('afterUndo', avoidBadUndo);
            editor.on('afterRedo', avoidBadUndo);


            // Buttons to launch the file picker easily
            // Files
            editor.addCommand('addFile', addFileCmd);

            editor.ui.addButton('addFile', {
                label: editor.lang.simpleuploads.addFile,
                command: 'addFile',
                icon: this.path + 'icons/addfile.png', // %REMOVE_LINE_CORE%
                toolbar: 'insert',
                allowedContent: 'a[!href];span[id](SimpleUploadsTmpWrapper);',
                requiredContent: 'a[!href]'
            });

            // Images
            editor.addCommand('addImage', addImageCmd);

            editor.ui.addButton && editor.ui.addButton('addImage', {
                label: editor.lang.simpleuploads.addImage,
                command: 'addImage',
                icon: this.path + 'icons/addimage.png', // %REMOVE_LINE_CORE%
                toolbar: 'insert',
                allowedContent: 'img[!src,width,height];span[id](SimpleUploadsTmpWrapper);',
                requiredContent: 'img[!src]'
            });


            if (typeof FormData == 'undefined')
                return;

            var root,
                visibleRoot;
            var minX = -1, minY, maxX, maxY;
            // Hint in the main document
            var mainMinX = -1, mainMinY, mainMaxX, mainMaxY;

            var removeBaseHighlight = function () {
                var dialog = CKEDITOR.dialog.getCurrent();
                if (dialog) {
                    var div = dialog.parts.title.getParent();
                    div.removeClass('SimpleUploadsOverCover');
                }
                else {
                    editor.container.removeClass('SimpleUploadsOverContainer');
                }
            };

            CKEDITOR.on('simpleuploads.droppedFile', removeBaseHighlight);

            CKEDITOR.document.on('dragenter', function (e) {
                if (mainMinX == -1) {
                    if (!hasFiles(e))
                        return;

                    var dialog = CKEDITOR.dialog.getCurrent();
                    if (dialog) {
                        if (!dialog.handleFileDrop)
                            return;

                        var div = dialog.parts.title.getParent();
                        div.addClass('SimpleUploadsOverCover');
                    }
                    else {
                        if (!editor.readOnly)
                            editor.container.addClass('SimpleUploadsOverContainer');
                    }

                    mainMinX = 0;
                    mainMinY = 0;
                    mainMaxX = CKEDITOR.document.$.body.parentNode.clientWidth;
                    mainMaxY = CKEDITOR.document.$.body.parentNode.clientHeight;
                }
            });
            CKEDITOR.document.on('dragleave', function (e) {
                if (mainMinX == -1)
                    return;

                var ev = e.data.$;
                if ((ev.clientX <= mainMinX) || (ev.clientY <= mainMinY) || (ev.clientX >= mainMaxX) || (ev.clientY >= mainMaxY)) {
                    removeBaseHighlight();
                    mainMinX = -1;
                }
            });

            var rootDropListener = function (e) {
                // editor
                visibleRoot.removeClass("SimpleUploadsOverEditor");
                minX = -1;

                //container
                // We fire an event on CKEDITOR so all the instances get notified and remove their class
                // This is an "internal" event to the plugin
                CKEDITOR.fire('simpleuploads.droppedFile');
                mainMinX = -1;

                if (editor.readOnly) {
                    e.data.preventDefault();
                    return false;
                }

                var ev = e.data.$,
                    data = ev.dataTransfer;
                if (data && data.files && data.files.length > 0) {
                    // Create Undo image
                    editor.fire("saveSnapshot");

                    for (var i = 0; i < data.files.length; i++) {
                        var file = data.files[i],
                            id = CKEDITOR.tools.getNextId(),
                            fileName = file.name,
                            evData = {
                                context: ev,
                                name: fileName,
                                file: file,
                                id: id
                            },
                            range;

                        // Prevent default insertion
                        e.data.preventDefault();

                        // If shift is pressed, create a link even if the drop is an image
                        var forceLink = ev.shiftKey;
                        createPreview(evData, editor, forceLink);

                        if (!uploadFile(editor, forceLink, evData))
                            continue;

                        var element = evData.element;

                        // if we're adding several links, add a space between them
                        if (range && element.getName() == "a") {
                            if (range.pasteHTML)
                                range.pasteHTML("&nbsp;"); // simple space doesn't work
                            else
                                range.insertNode(editor.document.$.createTextNode(' '));
                        }

                        var target = ev.target;
                        if (!range) {
                            var doc = editor.document.$;
                            // Move to insertion point
                            /*
                            standard way: only implemented in Firefox 20
                            if (document.caretPositionFromPoint)
                            {
                                var caret = document.caretPositionFromPoint(ev.pageX, ev.pageY),
                                    textNode = caret.offsetNode,
                                    offset = caret.offset;
                            }
                            */

                            // Firefox, custom properties in event.
                            if (ev.rangeParent) {
                                var node = ev.rangeParent,
                                    offset = ev.rangeOffset;
                                range = doc.createRange();
                                range.setStart(node, offset);
                                range.collapse(true);
                            }
                            else {
                                // Webkit, old documentView API
                                if (document.caretRangeFromPoint) {
                                    range = doc.caretRangeFromPoint(ev.clientX, ev.clientY);
                                }
                                else {
                                    // IE
                                    if (target.nodeName.toLowerCase() == "img") {
                                        range = doc.createRange();
                                        range.selectNode(target);
                                    } else if (document.body.createTextRange) {
                                        var textRange = doc.body.createTextRange();
                                        try {
                                            textRange.moveToPoint(ev.clientX, ev.clientY);
                                            /*
                                            // Convert to W3C range:
                                            var node = textRange.parentElement();
                                            var start = Math.abs( textRange.duplicate().moveStart('character', -1000000) );
                                            var r = textRange.duplicate();
                                            r.moveToElementText( node );
                                            r.collapse();
                                            var start2 = Math.abs( r.moveStart('character', -1000000) );
    
                                            range = doc.createRange();
                                            range.setStart( node.firstChild, start - start2 );
                                            range.collapse( true );
                                            */
                                            range = textRange;
                                        }
                                        catch (ex) {
                                            range = doc.createRange();
                                            range.setStartAfter(doc.body.lastChild);
                                            range.collapse(true);
                                        }
                                    }
                                }
                            }
                        }

                        var count = data.files.length,
                            elementName = element.getName(),
                            handled = false;

                        if (count == 1) {
                            if (target.nodeName.toLowerCase() == "img" && elementName == "span") {
                                target.parentNode.replaceChild(element.$, target);
                                evData.originalNode = target;
                                handled = true;
                            }

                            if (elementName == "a") {
                                var start;
                                if (range.startContainer) {
                                    start = range.startContainer;
                                    if (start.nodeType == document.TEXT_NODE)
                                        start = start.parentNode;
                                    else {
                                        if (range.startOffset < start.childNodes.length)
                                            start = start.childNodes[range.startOffset];
                                    }
                                }
                                else
                                    start = range.parentElement();

                                if (!start || target.nodeName.toLowerCase() == "img")
                                    start = target;

                                var parent = start;
                                while (parent && (parent.nodeType == document.ELEMENT_NODE) && (parent.nodeName.toLowerCase() != "a"))
                                    parent = parent.parentNode;

                                if (parent && parent.nodeName && parent.nodeName.toLowerCase() == "a") {
                                    parent.parentNode.replaceChild(element.$, parent);
                                    evData.originalNode = parent;
                                    handled = true;
                                }
                                // dropping on an image without a parent link
                                if (!handled && start.nodeName.toLowerCase() == "img") {
                                    parent = start.ownerDocument.createElement('a');
                                    parent.href = '#';
                                    start.parentNode.replaceChild(parent, start);
                                    parent.appendChild(start);

                                    parent.parentNode.replaceChild(element.$, parent);
                                    evData.originalNode = parent;
                                    handled = true;
                                }
                            }
                        }

                        if (!handled) {
                            if (range) {
                                if (range.pasteHTML)
                                    range.pasteHTML(element.$.outerHTML);
                                else
                                    range.insertNode(element.$);
                            }
                            else
                                editor.insertElement(element);
                        }

                        setupCancelButton(editor, evData);
                        editor.fire("saveSnapshot");
                    }
                }
            };

            var rootDragEnter = function (e) {
                if (minX == -1) {
                    if (!hasFiles(e))
                        return;

                    if (!editor.readOnly)
                        visibleRoot.addClass("SimpleUploadsOverEditor");

                    var rect = visibleRoot.$.getBoundingClientRect();
                    minX = rect.left;
                    minY = rect.top;
                    maxX = minX + visibleRoot.$.clientWidth;
                    maxY = minY + visibleRoot.$.clientHeight;
                }
            };

            var rootDragLeave = function (e) {
                if (minX == -1)
                    return;

                var ev = e.data.$;

                if ((ev.clientX <= minX) || (ev.clientY <= minY) || (ev.clientX >= maxX) || (ev.clientY >= maxY)) {
                    visibleRoot.removeClass("SimpleUploadsOverEditor");
                    minX = -1;
                }
            };

            var rootDragOver = function (e) {
                if (minX != -1) {
                    if (editor.readOnly) {
                        e.data.$.dataTransfer.dropEffect = "none";
                        e.data.preventDefault();
                        return false;
                    }

                    // Show Copy instead of Move. Works for Chrome
                    // Firefox and IE10 don't respect this change (Firefox by default doesn't enter here)
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=484511
                    e.data.$.dataTransfer.dropEffect = 'copy';

                    // IE always requires this
                    // Chrome almost fixed the requirement, but it's required if the body is a single line and the user drops below it.
                    if (!CKEDITOR.env.gecko)
                        e.data.preventDefault();
                }
            };

            // drag & drop, paste
            editor.on('contentDom', function (ev) {
                root = editor.document;
                visibleRoot = root.getBody().getParent();

                // v4 inline editing
                // ELEMENT_MODE_INLINE
                if (editor.elementMode == 3) {
                    root = editor.element;
                    visibleRoot = root;
                }
                // v4 divArea
                if (editor.elementMode == 1 && 'divarea' in editor.plugins) {
                    root = editor.editable();
                    visibleRoot = root;
                }

                root.on("paste", pasteListener, null, { editor: editor });

                root.on('dragenter', rootDragEnter);

                root.on('dragleave', rootDragLeave);

                // https://bugs.webkit.org/show_bug.cgi?id=57185
                if (!CKEDITOR.env.gecko) {
                    root.on('dragover', rootDragOver);
                }

                // Must use CKEditor 3.6.3 for IE 10
                root.on('drop', rootDropListener);
            });

            editor.on('contentDomUnload', function (ev) {
                if (!root || !root.removeListener)
                    return;

                root.removeListener("paste", pasteListener);
                root.removeListener('dragenter', rootDragEnter);
                root.removeListener('dragleave', rootDragLeave);
                root.removeListener('dragover', rootDragOver);
                root.removeListener('drop', rootDropListener);

                root = null;
                visibleRoot = null;
            });

            editor.plugins.fileDropHandler = {
                addTarget: function (target, callback) {
                    target.on('dragenter', function (e) {
                        if (minX == -1) {
                            if (!hasFiles(e))
                                return;

                            target.addClass('SimpleUploadsOverDialog');

                            var rect = target.$.getBoundingClientRect();
                            minX = rect.left;
                            minY = rect.top;
                            maxX = minX + target.$.clientWidth;
                            maxY = minY + target.$.clientHeight;
                        }
                    });

                    target.on('dragleave', function (e) {
                        if (minX == -1)
                            return;

                        var ev = e.data.$;

                        if ((ev.clientX <= minX) || (ev.clientY <= minY) || (ev.clientX >= maxX) || (ev.clientY >= maxY)) {
                            target.removeClass('SimpleUploadsOverDialog');
                            minX = -1;
                        }
                    });

                    target.on('dragover', function (e) {
                        if (minX != -1) {
                            // Show Copy instead of Move. Works for Chrome
                            // Firefox and IE10 don't respect this change (Firefox by default doesn't enter here)
                            // https://bugzilla.mozilla.org/show_bug.cgi?id=484511
                            e.data.$.dataTransfer.dropEffect = 'copy';

                            e.data.preventDefault();
                        }
                    });

                    target.on('drop', function (e) {
                        target.removeClass('SimpleUploadsOverDialog');
                        minX = -1;

                        //container
                        // We fire an event on CKEDITOR so all the instances get notified and remove their class
                        // This is an "internal" event to the plugin
                        CKEDITOR.fire('simpleuploads.droppedFile');
                        mainMinX = -1;

                        var ev = e.data.$,
                            data = ev.dataTransfer;
                        if (data && data.files && data.files.length > 0) {
                            for (var i = 0; i < data.files.length; i++) {
                                var file = data.files[i],
                                    id = CKEDITOR.tools.getNextId(),
                                    fileName = file.name;

                                // Prevent default insertion
                                e.data.preventDefault();

                                var evdata = {
                                    context: ev,
                                    name: fileName,
                                    file: file,
                                    id: id
                                };

                                evdata.callback = callback;

                                // only one
                                if (uploadFile(editor, false, evdata))
                                    return;
                            }
                        }
                    });
                }
            };


        }, //Init

        afterInit: function (editor) {
            var dataProcessor = editor.dataProcessor,
                htmlFilter = dataProcessor && dataProcessor.htmlFilter;

            if (htmlFilter)
                htmlFilter.addRules(htmlFilterRules, { applyToAll: true });
        }

    });

    // Creates the element, but doesn't insert it
    function createPreview(data, editor, forceLink) {
        var isImage = editor.config.simpleuploads_imageRegexp.test(data.name),
            showImageProgress = !editor.config.simpleuploads_hideImageProgress,
            element;

        // Create and insert our element
        if (!forceLink && isImage && showImageProgress) {
            element = createSVGAnimation(data.file, data.id, editor);
        }
        else {
            if (isImage && !forceLink)
                element = new CKEDITOR.dom.element("span", editor.document);
            else
                element = new CKEDITOR.dom.element("a", editor.document);

            element.setAttribute("id", data.id);
            element.setAttribute("class", "SimpleUploadsTmpWrapper");
            //element.setText( data.name );

            var html = "<span class='uploadName'>" + data.name + "</span>" +
                " <span class='uploadRect'><span id='rect" + data.id + "'></span></span>" +
                " <span id='text" + data.id + "' class='uploadText'> </span><span class='uploadCancel'>x</span>";
            element.setHtml(html);
        }
        // Prevent selection handles in IE
        element.setAttribute('contentEditable', false);

        data.element = element;
    }

    function errorListener(e) {
        alert("Failed to load the image with the provided URL: '" + e.sender.data('cke-saved-src') + "'");
        e.listenerData.remove();
    }

    function checkLoadedImage(img, editor, el, name) {
        if (img.$.naturalWidth === 0) {
            // when replacing an image, IE might fire the load event, but it still uses the old data
            window.setTimeout(function () { checkLoadedImage(img, editor, el, name); }, 50);
            return;
        }

        img.replace(el);
        img.setAttribute("width", img.$.width);
        img.setAttribute("height", img.$.height);

        editor.fire('simpleuploads.finishedUpload', { name: name, element: img });

        // Correct the Undo image
        editor.fire("updateSnapshot");
    }


    // Sets up a XHR object to handle the upload
    function createXHRupload(editor, forceLink, data) {

        if (!data.file.name && data.name)
            data.file.name = data.name;

        CKEDITOR.createLineAndUpload(data.file, function (xhr) {

            var isImage = editor.config.simpleuploads_imageRegexp.test(data.name),
                attribute,
                target = xhr.upload,
                forImage;

            if (!forceLink && isImage) {
                attribute = "src";
                forImage = true;
            }
            else {
                attribute = "href";
                forImage = false;
            }

            // nice progress effect. Opera used to lack xhr.upload
            if (target) {
                target.onprogress = function (evt) {
                    updateProgress(editor, data.id, evt);
                };
            }

            if (data.callback)
                data.callback.setup(data);

            //if (!data.url)
            //    data.url = getUploadUrl(editor, 2, forImage);

            var result = editor.fire("simpleuploads.startUpload", data);
            // in v3 cancel() returns true and in v4 returns false
            // if not canceled it's the data object, so let's use that.
            if (typeof result == "boolean")
                return null;

            data.xhr = xhr;

            //// Upload the file
            //xhr.open("POST", data.url);

            var oldOnLoad = xhr.onload;
            xhr.onload = function (e) {
                // Upon finish, get the url and update the file
                //		var parts = xhr.responseText.match(/2,\s*("|')(.*?[^\\]?)\1(?:,\s*\1(.*?[^\\]?)\1)?\s*\)/),

                oldOnLoad(e);

                var result = JSON.parse(xhr.responseText);

                var fileUrl = result.FullWebPath,
                    id = data.id,
                    el = editor.document.getById(id);


                // final update
                updateProgress(editor, id, null);
                // Correct the Undo image
                editor.fire("updateSnapshot");

                editor.fire('simpleuploads.endUpload', { name: data.name, ok: (!!fileUrl) });
                if (xhr.status != 200) {
                    if (xhr.status == 413)
                        alert(editor.lang.simpleuploads.fileTooBig);
                    else
                        alert('Error posting the file to ' + data.url + '\r\nResponse status: ' + xhr.status);

                    if (window.console)
                        console.log(xhr);
                }

                if (data.callback) {
                    if (!fileUrl && msg)
                        alert(msg);

                    data.callback.upload(fileUrl, msg, data);
                    return;
                }

                // If the element doesn't exists it means that the user has deleted it or pressed undo while uploading
                // so let's get out
                if (!el)
                    return;

                if (fileUrl) {
                    fileUrl = fileUrl.replace(/\\'/g, "'");
                    if (el.$.nodeName.toLowerCase() == "span") {
                        // create the final img, getting rid of the fake div
                        var img;
                        if (data.originalNode) {
                            img = data.originalNode.cloneNode(true);
                            // reset size
                            img.removeAttribute("width");
                            img.removeAttribute("height");
                            img.style.width = "";
                            img.style.height = "";
                            img = new CKEDITOR.dom.element(img);
                        }
                        else {
                            img = new CKEDITOR.dom.element("img", editor.document);
                        }

                        img.data('cke-saved-src', fileUrl);
                        img.setAttribute('src', fileUrl);

                        // wait to replace until the image is loaded to prevent flickering
                        img.on("load", function (e) {
                            e.removeListener();
                            img.removeListener("error", errorListener);

                            checkLoadedImage(img, editor, el, data.name);
                        });

                        img.on("error", errorListener, null, el);

                        // in case the user tries to get the html right now, a little protection
                        el.data('cke-real-element-type', "img");
                        el.data('cke-realelement', encodeURIComponent(img.getOuterHtml()));
                        el.data('cke-real-node-type', CKEDITOR.NODE_ELEMENT);

                        return;
                    }
                    if (data.originalNode) {
                        var newEl = data.originalNode.cloneNode(true);
                        el.$.parentNode.replaceChild(newEl, el.$);
                        el = new CKEDITOR.dom.element(newEl);
                    }
                    else {
                        el.removeAttribute("id");
                        el.removeAttribute("class");
                        el.removeAttribute('contentEditable');
                        el.setHtml(el.getFirst().getHtml());
                    }

                    el.data('cke-saved-' + attribute, fileUrl);
                    el.setAttribute(attribute, fileUrl);
                    editor.fire('simpleuploads.finishedUpload', { name: data.name, element: el });
                }
                else {
                    if (data.originalNode)
                        el.$.parentNode.replaceChild(data.originalNode, el.$);
                    else
                        el.remove();

                    if (msg)
                        alert(msg);
                }
                // Correct undo image
                editor.fire("updateSnapshot");
            };

            var oldOnerror = oldOnerror;
            xhr.onerror = function (e) {
                oldOnerror(e);
                alert('Error posting the file to ' + data.url);
                if (window.console)
                    console.log(e);

                var el = editor.document.getById(data.id);
                if (el) {
                    if (data.originalNode)
                        el.$.parentNode.replaceChild(data.originalNode, el.$);
                    else
                        el.remove();
                }
                // Correct undo image
                editor.fire("updateSnapshot");
            };
            var oldOnabort = xhr.onabort;
            xhr.onabort = function (e) {

                oldOnabort();

                if (data.callback) {
                    data.callback.upload(null);
                    return;
                }

                var el = editor.document.getById(data.id);
                if (el) {
                    if (data.originalNode)
                        el.$.parentNode.replaceChild(data.originalNode, el.$);
                    else
                        el.remove();
                }
                // Correct undo image
                editor.fire("updateSnapshot");
            };

            // CORS https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
            xhr.withCredentials = true;

            return xhr;
        });
    }

    // Takes care of uploading the file object using XHR
    function uploadFile(editor, forceLink, data)
    {
        if (data.callback && data.callback.start)
            data.callback.start(data);

        createXHRupload(editor, forceLink, data);

        return true;
    }

    function updateProgress(editor, id, evt) {
        if (!editor.document || !editor.document.$)
            return;

        var dialog = CKEDITOR.dialog.getCurrent();

        var doc = (dialog ? CKEDITOR : editor).document.$,
            rect = doc.getElementById("rect" + id),
            text = doc.getElementById("text" + id),
            value, textValue;

        if (evt) {
            if (!evt.lengthComputable)
                return;

            value = (100 * evt.loaded / evt.total).toFixed(2) + "%";
            textValue = (100 * evt.loaded / evt.total).toFixed() + "%";
        }
        else {
            textValue = editor.lang.simpleuploads.processing;
            value = "100%";
            /*
                if (text)
                {
                    text.parentNode.removeChild(text);
                    text = null;
                }
            */
        }
        if (rect) {
            rect.setAttribute("width", value);
            rect.style.width = value;
            if (!evt) {
                var parent = rect.parentNode;
                if (parent && parent.className == "uploadRect")
                    parent.parentNode.removeChild(parent);
            }
        }
        if (text) {
            text.firstChild.nodeValue = textValue;
            if (!evt) {
                // Remove cancel button
                var sibling = text.nextSibling;
                if (sibling && sibling.nodeName.toLowerCase() == "a")
                    sibling.parentNode.removeChild(sibling);
            }
        }
    }

    // Show a grayscale version of the image that animates toward the full color version
    function createSVGAnimation(file, id, editor) {
        var element = new CKEDITOR.dom.element("span", editor.document),
            div = element.$,
            theURL,
            doc = editor.document.$,
            span = doc.createElement("span");

        element.setAttribute("id", id);
        element.setAttribute("class", "SimpleUploadsTmpWrapper");
        var rectSpan = doc.createElement("span");
        rectSpan.setAttribute("id", "text" + id);
        rectSpan.appendChild(doc.createTextNode("0 %"));
        div.appendChild(span);
        span.appendChild(rectSpan);

        var cancelSpan = doc.createElement("span");
        cancelSpan.appendChild(doc.createTextNode('x'));
        span.appendChild(cancelSpan);

        if (typeof file != "string") {
            theURL = window.URL || window.webkitURL;
            if (!theURL || !theURL.revokeObjectURL)
                return element;
        }

        var svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", "svg" + id);

        // just to find out the image dimensions as they are needed for the svg block
        var img = doc.createElement("img");
        if (theURL) {
            img.onload = function (e) {
                if (this.onload) {
                    theURL.revokeObjectURL(this.src);
                    this.onload = null;
                }

                // in IE it's inserted with the HTML, so we can't reuse the svg object
                var svg = doc.getElementById("svg" + id);
                svg.setAttribute("width", this.width + "px");
                svg.setAttribute("height", this.height + "px");
                // Chrome
                doc.getElementById(id).style.width = this.width + "px";
            };
            img.src = theURL.createObjectURL(file);
        }
        else {
            // base64 data, dimensions are available right now in Firefox
            img.src = file;
            // extra protection
            img.onload = function (e) {
                this.onload = null;

                // we're pasting so it's inserted with the HTML, so we can't reuse the svg object
                var svg = doc.getElementById("svg" + id);
                if (svg) {
                    svg.setAttribute("width", this.width + "px");
                    svg.setAttribute("height", this.height + "px");
                }
            };
            svg.setAttribute("width", img.width + "px");
            svg.setAttribute("height", img.height + "px");
        }

        div.appendChild(svg);

        var filter = doc.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", "SVGdesaturate");
        svg.appendChild(filter);

        var feColorMatrix = doc.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
        feColorMatrix.setAttribute("type", "saturate");
        feColorMatrix.setAttribute("values", "0");
        filter.appendChild(feColorMatrix);

        var clipPath = doc.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", "SVGprogress" + id);
        svg.appendChild(clipPath);

        var rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("id", "rect" + id);
        rect.setAttribute("width", "0");
        rect.setAttribute("height", "100%");
        clipPath.appendChild(rect);

        var image = doc.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("width", "100%");
        image.setAttribute("height", "100%");

        if (theURL) {
            image.setAttributeNS('http://www.w3.org/1999/xlink', "href", theURL.createObjectURL(file));
            var loaded = function (e) {
                theURL.revokeObjectURL(image.getAttributeNS('http://www.w3.org/1999/xlink', "href"));
                image.removeEventListener("load", loaded, false);
            };
            image.addEventListener("load", loaded, false);
        }
        else
            image.setAttributeNS('http://www.w3.org/1999/xlink', "href", file);

        var image2 = image.cloneNode(true);
        image.setAttribute("filter", "url(#SVGdesaturate)");
        image.style.opacity = "0.5";

        svg.appendChild(image);

        image2.setAttribute("clip-path", "url(#SVGprogress" + id + ")");
        svg.appendChild(image2);

        return element;
    }


    // Compatibility between CKEditor 3 and 4
    if (CKEDITOR.skins) {
        CKEDITOR.plugins.setLang = CKEDITOR.tools.override(CKEDITOR.plugins.setLang, function (originalFunction) {
            return function (plugin, lang, obj) {
                if (plugin != "devtools" && typeof obj[plugin] != "object") {
                    var newObj = {};
                    newObj[plugin] = obj;
                    obj = newObj;
                }
                originalFunction.call(this, plugin, lang, obj);
            };
        });
    }

    function createSimpleUpload(editor, dialogName, definition, element) {
        if (element.type == "file")
            return;

        var targetField = element.filebrowser.target.split(":");
        var callback = {
            setup: function (data) {
                if (!definition.uploadUrl)
                    return;

                var params = {};
                params.CKEditor = editor.name;
                params.CKEditorFuncNum = 2;
                params.langCode = editor.langCode;

                data.url = addQueryString(definition.uploadUrl, params);
            },
            start: function (data) {
                var dialog = CKEDITOR.dialog.getCurrent();
                dialog.showThrobber();
                var throbber = dialog.throbber;

                if (data.xhr) {
                    var html = "<span class='uploadName'>" + data.name + "</span>" +
                        " <span class='uploadRect'><span id='rect" + data.id + "'></span></span>" +
                        " <span id='text" + data.id + "' class='uploadText'> </span><a>x</a>";

                    throbber.throbberTitle.setHtml(html);

                    var cover = throbber.throbberCover;
                    var xhr = data.xhr;
                    if (cover.timer) {
                        clearInterval(cover.timer);
                        cover.timer = null;
                    }
                    throbber.throbberParent.setStyle("display", "none");
                    throbber.throbberTitle.getLast().on('click', function () {
                        xhr.abort();
                    });

                    // protection to check that the upload isn't pending when forcing to close the dialog
                    dialog.on('hide', function () {
                        if (xhr.readyState == 1)
                            xhr.abort();
                    });
                }

                throbber.center();
            },
            upload: function (url, msg, data) {
                var dialog = CKEDITOR.dialog.getCurrent();
                dialog.throbber.hide();

                if (typeof msg == 'function' && msg.call(data.context.sender) === false)
                    return;

                if (definition.onFileSelect) {
                    if (definition.onFileSelect.call(data.context.sender, url, msg) === false)
                        return;
                }

                if (!url)
                    return;

                dialog.getContentElement(targetField[0], targetField[1]).setValue(url);
                dialog.selectPage(targetField[0]);

            }
        };

        if (element.filebrowser.action == "QuickUpload") {
            definition.hasQuickUpload = true;
            definition.onFileSelect = null;
            if (!editor.config.simpleuploads_respectDialogUploads) {
                element.label = (dialogName.substr(0, 5) == "image" ? editor.lang.simpleuploads.addImage : editor.lang.simpleuploads.addFile);

                element.onClick = function (evt) {
                    // "element" here means the definition object, so we need to find the correct
                    // button to scope the event call
                    //var sender = evt.sender;
                    PickAndUploadFile(editor, false, evt, callback);
                    return false;
                };

                var picker = definition.getContents(element["for"][0]).get(element["for"][1]);
                picker.hidden = true;
            }
        } else {
            // if the dialog has already been configured with quickUpload there's no need to use the file browser config
            if (definition.hasQuickUpload)
                return;

            if (element.filebrowser.onSelect)
                definition.onFileSelect = element.filebrowser.onSelect;
        }

        if (!editor.plugins.fileDropHandler)
            return;

        if (element.filebrowser.action == "QuickUpload")
            definition.uploadUrl = element.filebrowser.url;

        definition.onShow = CKEDITOR.tools.override(definition.onShow, function (original) {
            return function () {
                if (typeof original == 'function')
                    original.call(this);

                if (element.filebrowser.action != "QuickUpload" && definition.hasQuickUpload)
                    return;

                var dialog = this;
                if (dialog.handleFileDrop)
                    return;
                dialog.handleFileDrop = true;
                dialog.getParentEditor().plugins.fileDropHandler.addTarget(dialog.parts.contents, callback);
            };
        });
    }

    // Searches for elements in the dialog definition where we can apply our enhancements
    function applySimpleUpload(editor, dialogName, definition, elements) {
        for (var i in elements) {
            var element = elements[i];

            if (element.type == 'hbox' || element.type == 'vbox' || element.type == 'fieldset')
                applySimpleUpload(editor, dialogName, definition, element.children);

            if (element.filebrowser && element.filebrowser.url)
                createSimpleUpload(editor, dialogName, definition, element);
        }
    }

    function setupCancelButton(editor, data) {
        var element = editor.document.getById(data.id);
        if (!element)
            return;
        var links = element.$.getElementsByTagName("a");
        if (!links || !links.length) {
            links = element.$.getElementsByTagName("span");
            if (!links || !links.length)
                return;
        }
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.innerHTML == "x") {
                link.className = "uploadCancel";
                link.onclick = function () {
                    if (data.xhr)
                        data.xhr.abort();
                };
            }
        }
    }

    function pasteListener(e) {
        var editor = e.listenerData.editor,
            dialog = e.listenerData.dialog,
            i,
            item;

        // we want IE11 here to embed images as base64 (at least for the moment)
        // later use them as blob if we aren't in a dialog
        var data = e.data.$.clipboardData; // || window.clipboardData;
        if (!data)
            return;

        // Chrome has clipboardData.items. Other browsers don't provide this info at the moment.
        // Firefox implements clipboardData.files in 22
        var items = data.items || data.files;
        if (!items || !items.length)
            return;

        // Check first if there is a text/html or text/plain version, and leave the browser use that:
        // otherwise, pasting from MS Word to Chrome in Mac will always generate a black rectangle.
        if (items[0].kind) {
            for (i = 0; i < items.length; i++) {
                item = items[i];
                if (item.kind == "string" && (item.type == "text/html" || item.type == "text/plain"))
                    return;
            }
        }

        // We're safe, stupid Office-Mac combination won't disturb us.
        for (i = 0; i < items.length; i++) {
            item = items[i];
            if (item.kind && item.kind != "file")
                continue;

            e.data.preventDefault();

            var file = (item.getAsFile ? item.getAsFile() : item),
                id = getTimeStampId(),
                fileName = file.name || (id + ".png"),
                evData = {
                    context: e.data.$,
                    name: fileName,
                    file: file,
                    id: id
                };

            createPreview(evData, editor);

            // Upload the file
            if (!uploadFile(editor, false, evData))
                continue;

            var element = evData.element;

            if (dialog) {
                editor.fire("updateSnapshot");
                editor.insertElement(element);
                editor.fire("updateSnapshot");
            }
            else {
                // Insert in the correct position after the pastebin has been removed
                editor.document.getBody().append(element);

                window.setTimeout(function () {
                    editor.fire("updateSnapshot");
                    editor.insertElement(element);
                    editor.fire("updateSnapshot");
                    setupCancelButton(editor, evData);
                }, 0);
            }
        }

        // autoclose the dialog
        if (dialog && e.data.$.defaultPrevented)
            dialog.hide();
    }

    function setupPasteListener(iframe) {
        var doc = iframe.getFrameDocument(),
            body = doc.getBody();
        if (!body || !body.$ || body.$.contentEditable != "true") {
            setTimeout(function () { setupPasteListener(iframe); }, 100);
            return;
        }
        var dialog = CKEDITOR.dialog.getCurrent();

        doc.on("paste", pasteListener, null, {
            dialog: dialog,
            editor: dialog.getParentEditor()
        });
    }

    CKEDITOR.on("dialogDefinition", function (evt) {
        if (!evt.editor.plugins.simpleuploads)
            return;

        var definition = evt.data.definition;

        // Associate filebrowser to elements with 'filebrowser' attribute.
        for (var i in definition.contents) {
            var contents = definition.contents[i];
            if (contents)
                applySimpleUpload(evt.editor, evt.data.name, definition, contents.elements);
        }

        // Detect the Paste dialog
        if (evt.data.name == "paste") {
            definition.onShow = CKEDITOR.tools.override(definition.onShow, function (original) {
                return function () {
                    if (typeof original == "function")
                        original.call(this);

                    setupPasteListener(this.getContentElement("general", "editing_area").getInputElement());
                };
            });

        }

    }, null, null, 30);

})();


/**
 * Fired when file starts being uploaded by the "simpleuploads" plugin
 *
 * @since 3.1
 * @name CKEDITOR.editor#simpleuploads.startUpload
 * @event
 * @param {String} [name] The file name.
 * @param {String} [url] The url that will be used for the upload. It can be modified to your needs on each upload.
 * @param {String|Object} [context] Context that caused the upload (a string if it's a pasted image, a DOM event for drag&drop and copied files, the toolbar button for those cases)
 * @param {Object} [file] The file itself (if available).
 * @param {Object} [extraFields] Since 3.4.1 the event listener can add this property to indicate extra data to send in the upload as POST data
 */

/**
 * Fired when file upload ends on the "simpleuploads" plugin
 *
 * @since 3.1
 * @name CKEDITOR.editor#simpleuploads.endUpload
 * @event
 * @param {String} [name] The file name.
 * @param {Boolean} [ok] Whether the file has been correctly uploaded or not
 */

/**
 * Fired when the final element has been inserted by the "simpleuploads" plugin (after it has been uploaded)
 *
 * @since 3.3.4
 * @name CKEDITOR.editor#simpleuploads.finishedUpload
 * @event
 * @param {String} [name] The file name.
 * @param {CKEDITOR.dom.element} [element] The element node that has been inserted
 */


/**
 * Class to apply to the editor container (ie: the border outside the editor) when a file is dragged on the page
 *
 *		CKEDITOR.config.simpleuploads_containerover='border:1px solid red !important;';
 *
 * @since 2.7
 * @cfg {String} [simpleuploads_containerover='box-shadow: 0 0 10px 1px #99DD99 !important;']
 * @member CKEDITOR.config
 */

/**
 * Class to apply to the editor when a file is dragged over it
 *
 *		CKEDITOR.config.simpleuploads_editorover='background-color:yellow !important;';
 *
 * @since 2.7
 * @cfg {String} [simpleuploads_editorover='box-shadow: 0 0 10px 1px #999999 inset !important;']
 * @member CKEDITOR.config
 */

/**
 * Class to apply to the dialog border/cover when a file is dragged on the page
 *
 *		CKEDITOR.config.simpleuploads_coverover='border:1px solid red !important;';
 *
 * @since 4.0
 * @cfg {String} [simpleuploads_coverover='box-shadow: 0 0 10px 4px #999999 inset !important;']
 * @member CKEDITOR.config
 */

/**
 * Class to apply to the dialog content when a file is dragged over it
 *
 *		CKEDITOR.config.simpleuploads_dialogover='border:1px solid red !important;';
 *
 * @since 4.0
 * @cfg {String} [simpleuploads_dialogover='box-shadow: 0 0 10px 4px #999999 inset !important;']
 * @member CKEDITOR.config
 */


/**
 * List of extensions that should be recognized as belonging to image files (ie: a dropped file will be inserted as img instead of link)
 *
 *		config.simpleuploads_imageExtensions='jpe?g';
 *
 * @since 3.3.3
 * @cfg {String} [simpleuploads_imageExtensions='jpe?g|gif|png']
 * @member CKEDITOR.config
 */

/**
 * Maximum file size to allow the upload. By default there are no restrictions
 *
 *		config.simpleuploads_maxFileSize=10*1024*1024; // 10 Mb
 *
 * @since 3.3.3
 * @cfg {Number} [simpleuploads_maxFileSize=null]
 * @member CKEDITOR.config
 */


/**
 * List of extensions that aren't allowed (blacklist)
 *
 *		config.simpleuploads_invalidExtensions='exe|php';
 *
 * @since 3.3.3
 * @cfg {String} [simpleuploads_invalidExtensions=null]
 * @member CKEDITOR.config
 */

/**
 * List of extensions that are accepted (whitelist). If the file doesn't have this extension it will be rejected
 *
 *		config.simpleuploads_acceptedExtensions='jpg|png|pdf|zip';
 *
 * @since 3.3.3
 * @cfg {String} [simpleuploads_acceptedExtensions=null]
 * @member CKEDITOR.config
 */


/**
 * If it's set to true, the plugin won't modify the "Quick Upload" button in the dialogs
 * (just in case you are doing some special processing that isn't possible at the moment with the modified system)
 * (if you have such situation, please, contact me so that I can improve the plugin and allow you to use the plugin for everything)
 *
 *		config.simpleuploads_respectDialogUploads=true;
 *
 * @since 4.0
 * @cfg {Boolean} [simpleuploads_respectDialogUploads=null]
 * @member CKEDITOR.config
 */

/**
 * If it's set to true, images will be uploaded without the preview progress, using the plain text upload
 *
 *		CKEDITOR.config.simpleuploads_hideImageProgress=true;
 *
 * @since 4.1
 * @cfg {Boolean} [simpleuploads_hideImageProgress=null]
 * @member CKEDITOR.config
 */
