var TemplatesManager = function() {
    this.config = {
        jsonFile: '/src/sass/styles.json'
    }

    this.$loadingWrapper = $('.loading-wrapper');
    this.$generateButton = $('.json-preview-generate');
    this.$importButton = $('.json-preview-import');
    this.$resetButton = $('.json-preview-reset');
    this.$downloadButton = $('.json-preview-download');
    this.$jsonPreview = $('.json-preview');

    this.bindEvents();
    this.manageEditMode();
};

$.extend(TemplatesManager.prototype, {

    manageEditMode: function() {
        var editParameter = this.getUrlParameter('edit');
        var editLocalStorage = localStorage.getItem('editMode');
        if (editParameter === 'false') {
            this.disableEditMode();
        } else if (editParameter === 'true' || editLocalStorage === 'true') {
            this.enableEditMode();
        }
    },

    enableEditMode: function() {
        localStorage.setItem('editMode', 'true');
        $('body').addClass(window.project.classes.states.editing);
    },

    disableEditMode: function() {
        localStorage.removeItem('editMode');
    },

    bindEvents: function() {
        this.$resetButton.on('click', this.resetLocalJSON);
    },

    finishLoading: function() {
        this.$loadingWrapper.addClass(window.project.classes.states.loaded);
    },

    getJSON: function(callback) {
        if (typeof callback === 'function') {
            $.ajaxSetup({ async: true });
        } else {
            $.ajaxSetup({ async: false });
        }

        if (this.currentJSON) {
            return this.currentJSON;
        } else {
            $.getJSON(this.config.jsonFile, $.proxy(function(data) {
                var localJSON = this.getLocalJSON();

                this.currentJSON = data;

                // Return local JSON if more recent than file JSON
                if (localJSON !== null && localJSON.lastUpdated > data.lastUpdated) {
                    this.currentJSON = localJSON;
                    this.showResetButton();
                } else {
                    this.hideResetButton();
                }

                if (typeof callback === 'function') {
                    callback(this.currentJSON);
                }
            }, this));

            return this.currentJSON;
        }
    },

    showResetButton: function() {
        this.$resetButton.show();
    },

    hideResetButton: function() {
        this.$resetButton.hide();
    },

    getImportJSON: function() {
        var jsonPreviewValue = this.$jsonPreview.val();
        var data = (jsonPreviewValue !== '' ? JSON.parse(jsonPreviewValue) : false);
        return data;
    },

    getLocalJSON: function(callback) {
        return JSON.parse(localStorage.getItem('JSON'));
    },

    saveLocalJSON: function(data) {
        this.currentJSON = data;
        localStorage.setItem('JSON', JSON.stringify(data, null, 2));
        this.showResetButton();
    },

    resetLocalJSON: function() {
        localStorage.removeItem('JSON');
        window.location.reload();
    },

    updateJSON: function(data) {
        this.$jsonPreview.val(JSON.stringify(data, null, 2));
        this.saveLocalJSON(data);
    },

    downloadJSON: function(data) {
        var url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        var link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', 'styles.json');
        document.body.appendChild(link);
        setTimeout(function() {
            link.click();
            document.body.removeChild(link);
        }, 100);
    },

    getUrlParameter: function(parameter) {
        var pageURL = decodeURIComponent(window.location.search.substring(1)),
            parameters = pageURL.split('&'),
            parameterName;

        for (var i = 0; i < parameters.length; i++) {
            parameterName = parameters[i].split('=');

            if (parameterName[0] === parameter) {
                return parameterName[1] === undefined ? true : parameterName[1];
            }
        }
    }

});

(function($) {
    var TemplatesColors = function(element, options) {
        this.templatesColors = $(element);
        this.manager = new TemplatesManager();

        // Default module configuration
        this.defaults = {
            classes: {
                container: '.template-colors-wrapper',
                template: '.template-color.is-template',
                addButton: '.btn-add-color',
                preview: '.template-color',
                previewName: '.template-color-name',
                previewValue: '.template-color-value',
                previewColor: '.template-color-preview',
                previewColorPicker: '.template-color-picker',
                previewDescription: '.template-color-description',
                previewDeleteButton: '.btn-remove-color'
            }
        };

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, window.project.classes || {});

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        this.$container = $(this.classes.container);
        this.$template = $(this.classes.template);
        this.$addButton = this.$container.find(this.classes.addButton);

        this.init();
    };

    $.extend(TemplatesColors.prototype, {

        init: function() {
            this.bindEvents();
            this.loadJSON();
        },

        bindEvents: function() {
            this.$addButton.on('click', $.proxy(function() {
                this.createColorPreview({
                    name: 'c-',
                    value: '#',
                    description: 'Description'
                }, true);
            }, this));

            this.manager.$generateButton.on('click', $.proxy(this.generateJSON, this));
            this.manager.$importButton.on('click', $.proxy(this.importJSON, this));
            this.manager.$downloadButton.on('click', $.proxy(this.downloadJSON, this));
        },

        loadJSON: function() {
            this.manager.getJSON($.proxy(this.loadColors, this));
        },

        loadColors: function(data) {
            this.$container.find(this.classes.preview).remove();

            for (var index in data.colors) {
                var color = {};
                color.name = data.colors[index].name;
                color.value = data.colors[index].value;
                color.description = data.colors[index].description;

                this.createColorPreview(color, false);
            }

            this.manager.finishLoading();
        },

        createColorPreview: function(color, editable) {
            var $element = this.$template.clone().removeClass('is-template');
            var $previewName = $element.find(this.classes.previewName);
            var $previewValue = $element.find(this.classes.previewValue);
            var $previewDescription = $element.find(this.classes.previewDescription);
            var $previewColor = $element.find(this.classes.previewColor);
            var $previewColorPicker = $element.find(this.classes.previewColorPicker);
            var $deleteButton = $element.find(this.classes.previewDeleteButton);
            var id = 'picker' + (Math.floor(Math.random() * 5000) + 1);

            $previewName.val(color.name);
            $previewValue.val(color.value);
            $previewDescription.val(color.description);
            $previewColor.css('background-color', color.value);

            $previewColor.attr('for', id);
            $previewColorPicker.attr('id', id);

            if (!editable) {
                $deleteButton.hide();
                $element.find(this.classes.previewName).attr('readonly', 'true');
            } else {
                $deleteButton.on('click', $.proxy(function(event) {
                    this.deleteColorPreview($element);
                }, this));
            }

            $previewValue.add($previewColorPicker).on('change', $.proxy(function(event) {
                var color = $(event.currentTarget).val();

                this.updateColorPreview($element, color);
                this.updateLocalJSON();
            }, this));

            $previewName.add($previewDescription).on('change', $.proxy(function(event) {
                this.updateLocalJSON();
            }, this));

            this.$addButton.before($element);
        },

        updateColorPreview: function($preview, color) {
            $preview.find(this.classes.previewValue).val(color);
            $preview.find(this.classes.previewColorPicker).val(color);
            $preview.find(this.classes.previewColor).css('background-color', color);
        },

        deleteColorPreview: function($preview) {
            $preview.remove();
            this.updateLocalJSON();
        },

        getNewJSON: function() {
            var currentJSON = this.manager.getJSON();
            var colors = this.$container.find(this.classes.preview);

            currentJSON.colors = [];

            colors.each($.proxy(function(index, element) {
                var $element = $(element);
                var name = $element.find(this.classes.previewName).val();
                var value = $element.find(this.classes.previewValue).val();
                var description = $element.find(this.classes.previewDescription).val();

                currentJSON.colors.push({
                    name: name,
                    value: value,
                    description: description
                });
            }, this));

            currentJSON.lastUpdated = new Date().getTime();

            return currentJSON;
        },

        updateLocalJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.saveLocalJSON(currentJSON);
        },

        generateJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.updateJSON(currentJSON);
        },

        importJSON: function() {
            var importJSON = this.manager.getImportJSON();

            if (importJSON) {
                this.loadColors(importJSON);
                this.updateLocalJSON();
            }
        },

        downloadJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.downloadJSON(currentJSON);
        }
    });

    $.fn.templatesColors = function(options) {
        return this.each(function() {
            var element = $(this);

            if (element.data('templatesColors')) return;

            var templatesColors = new TemplatesColors(this, options);
            element.data('templatesColors', templatesColors);
        });
    };
})(jQuery);

(function($) {
    var TemplatesFonts = function(element, options) {
        this.templatesFonts = $(element);
        this.manager = new TemplatesManager();

        // Default module configuration
        this.defaults = {
            previewSentence: 'Libéo et les magiciens grincheux font un mélange toxique pour le mal de la Reine et Jack.',
            customFontVariants: ['100', '100italic', '300', '300italic', '400', '400italic', '500', '500italic', '600', '600italic', '700', '700italic', '800', '800italic', '900', '900italic'],
            googleApiKey: 'AIzaSyBAcrm-Ho-fu2b_LvHJJPoIjH4iJgcV054',
            classes: {
                container: '.template-fonts-wrapper',
                template: '.template-font.is-template',
                addButton: '.btn-add-font',
                showGoogleAddFontButton: '.btn-show-add-font-google',
                showGoogleAddFontSection: '.template-fonts-add-input-wrapper[data-type="google"]',
                showCustomAddFontButton: '.btn-show-add-font-custom',
                showCustomAddFontSection: '.template-fonts-add-input-wrapper[data-type="custom"]',
                fontsDropdown: '.template-fonts-add-select',
                addFontElementWrapper: '.template-fonts-add-input-wrapper',
                addFontElement: '.template-fonts-add-element',
                addFontCheckbox: '.template-fonts-add-font-checkbox',
                addFontGoogleButton: '.template-fonts-show-google-font',
                addFontVariantsWrapper: '.template-fonts-add-font-variants',
                preview: '.template-font',
                previewInput: '.template-font-input',
                previewName: '.template-font-name',
                previewType: '.template-font-type',
                previewVariants: '.template-font-preview',
                previewVariant: '.template-font-preview-variant',
                previewDeleteButton: '.btn-remove-font'
            },
        };

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, window.project.classes || {});

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        this.$container = $(this.classes.container);
        this.$template = $(this.classes.template);
        this.$showGoogleAddFontButton = $(this.classes.showGoogleAddFontButton);
        this.$showGoogleAddFontSection = $(this.classes.showGoogleAddFontSection);
        this.$showCustomAddFontButton = $(this.classes.showCustomAddFontButton);
        this.$showCustomAddFontSection = $(this.classes.showCustomAddFontSection);
        this.$addButton = $(this.classes.addButton);
        this.$addFontGoogleButton = $(this.classes.addFontGoogleButton);

        this.init();
    };

    $.extend(TemplatesFonts.prototype, {

        init: function() {
            this.bindEvents();
            this.loadJSON();
        },

        bindEvents: function() {
            this.$showGoogleAddFontButton.on('click', $.proxy(this.showGoogleAddFontSection, this));
            this.$showCustomAddFontButton.on('click', $.proxy(this.showCustomAddFontSection, this));

            this.$addButton.on('click', $.proxy(function(event) {
                var type = $(event.currentTarget).attr('data-type');
                this.createNewFontPreview(type);
            }, this));

            this.$addFontGoogleButton.on('click', $.proxy(function() {
                var selectedFont = $(this.classes.fontsDropdown).val();
                window.open('https://www.google.com/fonts/specimen/' + selectedFont, '_blank');
            }, this));

            this.manager.$generateButton.on('click', $.proxy(this.generateJSON, this));
            this.manager.$importButton.on('click', $.proxy(this.importJSON, this));
            this.manager.$downloadButton.on('click', $.proxy(this.downloadJSON, this));

            $(document).on('googleCallback', $.proxy(this.loadGoogleFontsAPI, this));
        },

        loadFonts: function(data) {
            this.$container.find(this.classes.preview).remove();

            for (var index in data.fonts) {
                var font = data.fonts[index];

                this.createFontPreview(font, false);
            }

            window.setTimeout($.proxy(function() {
                this.manager.finishLoading();
            }, this), 100);
        },

        loadGoogleFontsAPI: function() {
            gapi.client.setApiKey(this.config.googleApiKey);
            gapi.client.load('webfonts', 'v1', $.proxy(function() {
                var request = gapi.client.webfonts.webfonts.list();
                request.execute($.proxy(function(resp) {
                    fonts = resp.items;
                    this.updateFontsDropdown(fonts);
                }, this));
            }, this));
        },

        loadGoogleFont: function(family, variants) {
            WebFont.load({
                google: {
                    families: [family + ':' + variants]
                }
            });
        },

        createNewFontPreview: function(type) {
            var $addFontWrapper = $(this.classes.addFontElementWrapper + ':visible');
            var font = {};

            font.name = $addFontWrapper.find(this.classes.addFontElement).val();
            font.type = type;
            font.variants = [];

            var variants = $addFontWrapper.find(this.classes.addFontCheckbox + ':checked');
            variants.each(function(index, element) {
                font.variants.push($(element).val());
            });

            if (font.name !== '') {
                this.createFontPreview(font, true);
                this.updateLocalJSON();
            }
        },

        createFontPreview: function(font, editable) {
            var $preview = this.$template.clone().removeClass('is-template');
            var $previewInput = $preview.find(this.classes.previewInput);
            var $previewName = $preview.find(this.classes.previewName);
            var $previewType = $preview.find(this.classes.previewType);
            var $deleteButton = $preview.find(this.classes.previewDeleteButton);

            $previewInput.attr('id', font.name.toLowerCase().replace(' ', '-'));
            $previewName.text(font.name);
            $previewType.text(font.type);

            this.createFontPreviewVariants($preview, font);

            if (font.type === 'google') {
                this.loadGoogleFont(font.name, font.variants.join());
            }

            if (font.main) {
                $previewInput.attr('checked', 'checked');
            }

            $previewInput.on('change', $.proxy(function() {
                this.updateMainFont(font);
            }, this));

            if (!editable) {
                $deleteButton.hide();
            } else {
                $deleteButton.on('click', $.proxy(function(event) {
                    this.deleteFontPreview($preview);
                }, this));
            }

            this.$container.append($preview);
        },

        createFontPreviewVariants: function($preview, font) {
            var $previewVariants = $preview.find(this.classes.previewVariants);

            for (var index in font.variants) {
                var variant = font.variants[index];
                var fontWeight = 'normal';
                var fontStyle = 'normal';

                if (/^\d+$/.test(variant) || variant === 'regular') {
                    fontWeight = variant;
                } else if (/^\D+$/.test(variant)) {
                    fontStyle = variant;
                } else {
                    var matches = variant.match(/(\d+)(\w+)/);
                    fontWeight = matches[1];
                    fontStyle = matches[2];
                }

                $previewVariant = $('<p class="template-font-preview-' + fontWeight + '"></p>');
                $previewVariant.addClass(this.classes.previewVariant.replace('.', ''));
                $previewVariant.text(this.config.previewSentence);
                $previewVariant.attr('data-font-variants', variant);
                $previewVariant.css({
                    fontFamily: font.name,
                    fontWeight: fontWeight,
                    fontStyle: fontStyle
                });

                $previewVariants.append($previewVariant);
            }
        },

        updateFontsDropdown: function(fonts) {
            this.fontsDropdown = $(this.classes.fontsDropdown);

            this.fontsDropdown.each(function(index, element) {
                var $element = $(element);
                for (var index in fonts) {
                    var font = fonts[index].family;
                    var variants = fonts[index].variants.join();
                    $element.append('<option value="' + font + '" data-variants="' + variants + '">' + font + '</option>');
                }
            });

            this.fontsDropdown.on('change', $.proxy(function() {
                var selectedOption = this.fontsDropdown.find('option:selected');
                var variants = selectedOption.attr('data-variants').split(',');

                this.updateAddFontVariants(variants, 'google');
            }, this)).trigger('change');
        },

        updateMainFont: function(font) {
            var currentJSON = this.manager.getJSON();

            for (var index in currentJSON.typography) {
                var properties = currentJSON.typography[index].properties;
                if (properties['font-family'] === 'sans-serif') {
                    properties['font-family'] = font.name;
                }
            }

            this.updateLocalJSON(currentJSON);
        },

        updateAddFontVariants: function(variants, type) {
            if (type === 'google') {
                var $container = this.$showGoogleAddFontSection.find(this.classes.addFontVariantsWrapper);
            } else {
                var $container = this.$showCustomAddFontSection.find(this.classes.addFontVariantsWrapper);
            }

            // Reset variants
            $container.html('');

            for (var index in variants) {
                var $element = $('.template-fonts-add-font-variants-wrapper.is-template').clone();
                var variant = (variants[index] === 'regular' ? '400' : variants[index]);
                var label = $element.find('label');
                var checkbox = $element.find('input');
                var identifier = 'template-fonts-add-font-variants-' + variant;

                label.attr('for', identifier).find('span').text(variant);
                checkbox.attr('id', identifier).val(variant);
                $element.removeClass('is-template');

                if (variant === '400') {
                    checkbox.attr('checked', 'checked');
                }

                $container.append($element);
            }
        },

        deleteFontPreview: function($preview) {
            $preview.remove();
        },

        showGoogleAddFontSection: function() {
            this.$showGoogleAddFontButton.hide();
            this.$showGoogleAddFontSection.show();
            this.$showCustomAddFontButton.show();
            this.$showCustomAddFontSection.hide();
        },

        showCustomAddFontSection: function() {
            this.$showGoogleAddFontButton.show();
            this.$showGoogleAddFontSection.hide();
            this.$showCustomAddFontButton.hide();
            this.$showCustomAddFontSection.show();

            this.updateAddFontVariants(this.config.customFontVariants, 'custom');
        },

        getNewJSON: function(JSON) {
            var currentJSON = JSON || this.manager.getJSON();
            var fonts = this.$container.find(this.classes.preview);

            currentJSON.fonts = [];

            fonts.each($.proxy(function(index, element) {
                var $element = $(element);
                var $variantElements = $element.find(this.classes.previewVariant);
                var main = $element.find(this.classes.previewInput).is(':checked');
                var name = $element.find(this.classes.previewName).text();
                var type = $element.find(this.classes.previewType).text();
                var font = {};

                font.name = name;
                font.type = type;
                font.main = main;
                font.variants = [];

                $variantElements.each(function(index, element) {
                    var $element = $(element);
                    var variant = $element.attr('data-font-variants');
                    font.variants.push(variant);
                });

                currentJSON.fonts.push(font);
            }, this));

            currentJSON.lastUpdated = new Date().getTime();

            return currentJSON;
        },

        loadJSON: function() {
            this.manager.getJSON($.proxy(this.loadFonts, this));
        },

        updateLocalJSON: function(JSON) {
            var currentJSON = this.getNewJSON(JSON);

            this.manager.saveLocalJSON(currentJSON);
        },

        generateJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.updateJSON(currentJSON);
        },

        importJSON: function() {
            var importJSON = this.manager.getImportJSON();

            if (importJSON) {
                this.loadFonts(importJSON);
                this.updateLocalJSON();
            }
        },

        downloadJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.downloadJSON(currentJSON);
        }
    });

    $.fn.templatesFonts = function(options) {
        return this.each(function() {
            var element = $(this);

            if (element.data('templatesFonts')) return;

            var templatesFonts = new TemplatesFonts(this, options);
            element.data('templatesFonts', templatesFonts);
        });
    };
})(jQuery);

(function($) {
    var TemplatesTypography = function(element, options) {
        this.templatesTypography = $(element);
        this.manager = new TemplatesManager();

        // Default module configuration
        this.defaults = {
            mainFontAlertMessage: 'Aucune font principale trouvée. Vous devez définir une font principale avant de continuer.',
            classes: {
                wrapper: '.template-typography-wrapper',
                container: '.template-typography-edit-panel-wrapper',
                panelWrapper: '.template-typography-edit-panel',
                panel: '.template-typography-edit-panel-inputs',
                template: '.template-typography-edit-panel-inputs.is-template',
                selectorsDropdown: '.template-typography-edit-selector',
                breakpointsDropdown: '.template-typography-edit-breakpoint',
                fontFamilyDropdown: '.template-typography-edit-font-family',
                fontWeightDropdown: '.template-typography-edit-font-weight',
                fontStylesDropdown: '.template-typography-edit-font-style',
                colorsDropdown: '.template-typography-edit-color',
                typographyInput: '.template-typography-input',
                previewWrapper: '.template-typography-preview',
                previewContainer: '.template-typography-preview-container'
            }
        };

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, window.project.classes || {});

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        this.$wrapper = $(this.classes.wrapper);
        this.$container = $(this.classes.container);
        this.$previewWrapper = $(this.classes.previewWrapper);
        this.$previewContainer = $(this.classes.previewContainer);
        this.$panelWrapper = $(this.classes.panelWrapper);
        this.$template = $(this.classes.template);
        this.$selectorsDropdown = $(this.classes.selectorsDropdown);
        this.$breakpointsDropdown = $(this.classes.breakpointsDropdown);

        this.isShiftPressed = false;
        this.isAltPressed = false;

        this.init();
    };

    $.extend(TemplatesTypography.prototype, {

        // Component initialization
        init: function() {
            this.bindEvents();
            this.loadJSON();
            this.stickOnScroll();
        },

        loadTypography: function(data) {
            this.$container.html('');

            for (var index in data.typography) {
                var selector = data.typography[index].selector;
                var type = data.typography[index].type;
                var properties = data.typography[index].properties;
                var breakpoints = data.typography[index].breakpoints;
                var $element = this.$template.clone();
                var $fontWeightsDropdown = $element.find(this.classes.fontWeightDropdown);
                var $fontStylesDropdown = $element.find(this.classes.fontStylesDropdown);
                var $colorsDropdown = $element.find(this.classes.colorsDropdown);

                if (type === 'id') { selector = '#' + selector; }
                if (type === 'class') { selector = '.' + selector; }

                this.updateFontWeightsDropdown($fontWeightsDropdown, properties['font-family']);
                this.updateFontStylesDropdown($fontStylesDropdown, properties['font-family'], properties['font-weight']);
                this.updateColorsDropdown($colorsDropdown, data.colors);

                // Initialize each properties
                for (var index in properties) {
                    var property = index;
                    var value = properties[index];
                    var $input = $element.find('[data-edit="' + property + '"]');

                    $input.val(value);
                    $input.attr('data-breakpoint-default', value);

                    if (property === 'color') value = this.getColorValue(value);
                    if (property === 'font-family') $input.attr('data-font-family', value);

                    this.updateTypographyPreview(selector, property, value);
                }

                // Initialize each breakpoint properties
                for (var index in breakpoints) {
                    var breakpoint = index;
                    var properties = breakpoints[index];
                    for (var index in properties) {
                        var property = index;
                        var value = properties[index];
                        var $input = $element.find('[data-edit="' + property + '"]');
                        $input.attr('data-breakpoint-' + breakpoint, value);
                    }
                }

                // Append each edit panel
                $element.attr('data-selector', selector);
                $element.attr('data-type', type);
                $element.removeClass('is-template');
                this.$container.append($element);

                // Bind preview click event
                $(this.classes.previewWrapper + ' ' + selector).off('click', $.proxy(this.onPreviewTypographyClick, this));
                $(this.classes.previewWrapper + ' ' + selector).on('click', $.proxy(this.onPreviewTypographyClick, this));
            }

            var mainFonts = data.fonts.filter(function(font) {
                return font.main === true;
            });

            if (mainFonts.length === 0) this.createMainFontAlert();

            this.loadSelectorsDropdown(data.typography);
            this.loadBreakpointsDropdown(data.breakpoints);
            this.updateCurrentSelectedTypography('h1', false);
            this.updateFontDropdowns(data.fonts);

            this.manager.finishLoading();
        },

        bindEvents: function() {
            this.manager.$generateButton.on('click', $.proxy(this.generateJSON, this));
            this.manager.$importButton.on('click', $.proxy(this.importJSON, this));
            this.manager.$downloadButton.on('click', $.proxy(this.downloadJSON, this));

            $(document).on('change', this.classes.selectorsDropdown, $.proxy(function(event) {
                var selector = $(event.currentTarget).val();

                this.updateCurrentSelectedTypography(selector, true);
            }, this));

            $(document).on('change', this.classes.breakpointsDropdown, $.proxy(function(event) {
                var breakpoint = $(event.currentTarget).val();

                this.updateCurrentSelectedBreakpoint(breakpoint);
            }, this));

            $(document).on('change', this.classes.fontFamilyDropdown, $.proxy(function(event) {
                var fontFamily = $(event.currentTarget).val();
                var $currentPanel = $(this.classes.panel + '.is-active');
                var $fontWeightsDropdown = $currentPanel.find(this.classes.fontWeightDropdown);

                this.updateFontWeightsDropdown($fontWeightsDropdown, fontFamily);
            }, this));

            $(document).on('change', this.classes.fontWeightDropdown, $.proxy(function(event) {
                var $currentPanel = $(this.classes.panel + '.is-active');
                var $fontFamilyDropdown = $currentPanel.find(this.classes.fontFamilyDropdown);
                var $fontStylesDropdown = $currentPanel.find(this.classes.fontStylesDropdown);
                var fontFamily = $fontFamilyDropdown.val();
                var fontWeight = $(event.currentTarget).val();

                this.updateFontStylesDropdown($fontStylesDropdown, fontFamily, fontWeight);
            }, this));

            $(document).on('change', this.classes.typographyInput, $.proxy(function(event) {
                var selector = $(this.classes.selectorsDropdown).val();
                var $element = $(event.currentTarget);
                var property = $element.attr('data-edit');
                var value = $element.val();

                if (property === 'color') value = this.getColorValue(value);

                this.updateTypographyPreview(selector, property, value);
                this.updateInputBreakpointProperty($element);
                this.updateLocalJSON();
            }, this));

            $(document).on('keydown', this.classes.typographyInput, $.proxy(function(event) {
                var variance = 0;
                var $element = $(event.currentTarget);

                if (event.keyCode === 16) { // Shift
                    this.isShiftPressed = true;
                } else if (event.keyCode === 18) { // Alt
                    this.isAltPressed = true;
                } else if (event.keyCode === 38) { // Up arrow
                    variance = 1;
                    this.adjustInputValue($element, variance);
                } else if (event.keyCode === 40) { // Down arrow
                    variance = -1;
                    this.adjustInputValue($element, variance);
                }
            }, this));

            $(document).on('mousewheel', this.classes.typographyInput + '[type="text"]', $.proxy(function(event) {
                var variance = (event.originalEvent.wheelDelta > 0 ? 1 : -1);
                var $element = $(event.currentTarget);

                this.adjustInputValue($element, variance);
                event.preventDefault();
            }, this));

            $(document).on('keyup', this.classes.typographyInput, $.proxy(function(event) {
                if (event.keyCode === 16) this.isShiftPressed = false;
                if (event.keyCode === 18) this.isAltPressed = false;
            }, this));
        },

        loadSelectorsDropdown: function(typography) {
            this.$selectorsDropdown.html('');

            for (var index in typography) {
                var selector = typography[index].selector;
                var type = typography[index].type;

                if (type === 'id') { selector = '#' + selector; }
                if (type === 'class') { selector = '.' + selector; }

                var $option = $('<option value="' + selector + '" data-type="' + type + '">' + selector + '</option>');

                this.$selectorsDropdown.append($option);
            }
        },

        loadBreakpointsDropdown: function(breakpoints) {
            this.$breakpointsDropdown.html('');

            // Create 'default' option
            var $option = $('<option value="default">-</option>');
            this.$breakpointsDropdown.append($option);

            for (var index in breakpoints) {
                var name = breakpoints[index].name;
                var $option = $('<option value="' + name + '">' + name + '</option>');

                this.$breakpointsDropdown.append($option);
            }
        },

        updateCurrentSelectedTypography: function(selector, scroll) {
            var selectedOption = $(this.classes.selectorsDropdown).find('option:selected');
            var type = selectedOption.attr('data-type');

            $(this.classes.panel)
                .removeClass(this.classes.states.active)
                .filter('[data-selector="' + selector + '"]')
                .addClass(this.classes.states.active);
            $('.l-block-content .' + this.classes.states.editing).removeClass(this.classes.states.editing);

            if (type === 'element') {
                // Only return elements with no classes or ID
                var $element = $(this.classes.previewWrapper + ' ' + selector).filter(function(index) {
                    return this.classList.length === 0 && this.id === '';
                });
                $element.addClass(this.classes.states.editing);
            } else {
                var $element = $(selector)
                $element.addClass(this.classes.states.editing);
            }

            if (scroll) this.scrollToElement($element);
            this.updateCurrentBreakpointProperties();
        },

        updateCurrentSelectedBreakpoint: function(breakpoint) {
            var $panels = $(this.classes.panel + ':not(.is-template)');

            $panels.each($.proxy(function(index, element) {
                var $panel = $(element);
                var selector = $(element).attr('data-selector');
                var $inputs = $panel.find(this.classes.typographyInput);

                $inputs.each($.proxy(function(index, element) {
                    var $element = $(element);
                    var property = $element.attr('data-edit');
                    var value = $element.attr('data-breakpoint-' + breakpoint);

                    if (value === undefined) value = $element.attr('data-breakpoint-default');
                    $element.val(value);

                    if (property === 'color') value = this.getColorValue(value);
                    this.updateTypographyPreview(selector, property, value);
                }, this));
            }, this));

            if (breakpoint === 'mobile') {
                this.$previewContainer.addClass('is-mobile');
            } else {
                this.$previewContainer.removeClass('is-mobile');
            }
        },

        updateInputBreakpointProperty: function($element) {
            var currentBreakpoint = $(this.classes.breakpointsDropdown).find('option:selected').val();
            $element.attr('data-breakpoint-' + currentBreakpoint, $element.val());
        },

        updateCurrentBreakpointProperties: function() {
            var currentBreakpoint = $(this.classes.breakpointsDropdown).find('option:selected').val();
            var $inputs = $(this.classes.panel).find(this.classes.typographyInput);

            $inputs.each(function(index, element) {
                var $element = $(element);
                var value = $element.val();
                if (value !== null) $element.attr('data-breakpoint-' + currentBreakpoint, value);
            });
        },

        updateFontWeightsDropdown: function($dropdown, fontFamily) {
            var weights = this.getFontWeights(fontFamily);
            var currentValue = $dropdown.val();

            $dropdown.html('');

            for (var index in weights) {
                var weight = weights[index];
                $dropdown.append('<option value="' + weight + '" ' + (weight === currentValue ? 'selected="selected"' : '') + '>' + weight + '</option>');
            }

            $dropdown.trigger('change');
        },

        updateFontStylesDropdown: function($dropdown, fontFamily, fontWeight) {
            var styles = this.getFontStyles(fontFamily, fontWeight);
            var currentValue = $dropdown.val();

            $dropdown.html('');

            for (var index in styles) {
                var style = styles[index];
                $dropdown.append('<option value="' + style + '" ' + (style === currentValue ? 'selected="selected"' : '') + '>' + style + '</option>');
            }

            $dropdown.trigger('change');
        },

        updateColorsDropdown: function($dropdown, colors) {
            for (var index in colors) {
                var name = colors[index].name;
                var color = colors[index].value;
                $dropdown.append('<option value="' + name + '">' + name + '</option>');
            }
        },

        updateFontDropdowns: function(fonts) {
            var $fontDropdowns = $('.template-typography-edit-font-family');

            $fontDropdowns.each(function(index, element) {
                var $element = $(element);
                var currentFontFamily = $element.attr('data-font-family');
                for (var index in fonts) {
                    var font = fonts[index].name;
                    $element.append('<option value="' + font + '" ' + (currentFontFamily === font ? "selected" : "") + '>' + font + '</option>');
                }
            });
        },

        updateTypographyPreview: function(selector, property, value) {
            $(this.classes.previewWrapper + ' ' + selector).css(property, value).attr('data-selector', selector);
            $(this.classes.previewWrapper + ' :first-child').not('li > ul').not('li > ol').css('margin-top', '0');
            $(this.classes.previewWrapper + ' :last-child').not('li > ul').not('li > ol').css('margin-bottom', '0');
        },

        adjustInputValue: function($element, variance) {
            if (this.isShiftPressed) variance = variance * 10;
            if (this.isAltPressed) variance = variance * 0.10;

            var initialValue = $element.val();
            var matches = initialValue.match(/(.*\d+)(.+)/);
            var value = parseFloat((matches !== null ? matches[1] : 0));
            var unit = (matches !== null ? matches[2] : 'px');
            var newValue = (value * 1000 + variance * 1000) / 1000;

            $element.val(newValue + unit);
            $element.trigger('change');
        },

        onPreviewTypographyClick: function(event) {
            var $element = $(event.currentTarget);
            var selector = $element.attr('data-selector').toLowerCase();

            $(this.classes.selectorsDropdown).val(selector);
            this.updateCurrentSelectedTypography(selector, false);

            event.stopPropagation();
            event.preventDefault();
        },

        scrollToElement: function($element) {
            var offset = $element.offset().top - 50;

            $('html, body').animate({ scrollTop: offset });
        },

        stickOnScroll: function() {
            var offset = this.$panelWrapper.offset().top;

            $(window).on('scroll', $.proxy(function() {
                var scrollTop = $(window).scrollTop();
                if (scrollTop > offset) {
                    this.$panelWrapper.addClass('is-fixed');
                } else {
                    this.$panelWrapper.removeClass('is-fixed');
                }
            }, this)).trigger('scroll');
        },

        createMainFontAlert: function() {
            this.$wrapper.prepend('<p class="main-font-alert editing-element">' + this.config.mainFontAlertMessage + '</p>')
        },

        getFontWeights: function(fontFamily) {
            var currentJSON = this.manager.getJSON();
            var fontWeights = [];

            var matchingFonts = currentJSON.fonts.filter(function(font) {
                return font.name == fontFamily
            });

            for (var index in matchingFonts) {
                var currentFont = matchingFonts[index];
                var currentFontVariants = currentFont.variants;
                for (var index in currentFontVariants) {
                    var currentFontWeight = currentFontVariants[index];
                    if (/^\d+$/.test(currentFontWeight)) {
                        fontWeights.push(currentFontWeight);
                    } else {
                        var matches = currentFontWeight.match(/(\d+)(\w+)/);
                        if (matches && fontWeights.indexOf(matches[1]) === -1) {
                            fontWeights.push(matches[1]);
                        }
                    }
                }
            }

            return fontWeights;
        },

        getFontStyles: function(fontFamily, fontWeight) {
            var currentJSON = this.manager.getJSON();
            var fontStyles = ['normal'];

            var matchingFonts = currentJSON.fonts.filter(function(font) {
                return font.name == fontFamily
            });

            for (var index in matchingFonts) {
                var currentFont = matchingFonts[index];
                var currentFontVariants = currentFont.variants;
                for (var index in currentFontVariants) {
                    var currentFontStyle = currentFontVariants[index];
                    if (/^[a-zA-Z]+$/.test(currentFontStyle)) {
                        // Current font style is only letters (italic) so font-weight is 400 (regular)
                        currentFontStyle = '400' + currentFontStyle;
                    }
                    if (currentFontStyle.startsWith(fontWeight)) {
                        var fontStyle = currentFontStyle.replace(fontWeight, '');
                        if (fontStyle !== '' && fontStyles.indexOf(fontStyle) === -1) {
                            fontStyles.push(fontStyle);
                        }
                    }
                }
            }

            return fontStyles;
        },

        getColorValue: function(name) {
            var currentJSON = this.manager.getJSON();
            var currentColor = currentJSON.colors.filter(function(color) {
                return color.name === name;
            });

            return currentColor[0].value;
        },

        getNewJSON: function() {
            var currentJSON = this.manager.getJSON();
            var panels = $(this.classes.panel + ':not(.is-template)');

            // Reset current typography
            currentJSON.typography = [];

            panels.each($.proxy(function(index, element) {
                var $element = $(element);
                var selector = $element.attr('data-selector').replace('.', '').replace('#', '');
                var type = $element.attr('data-type');
                var inputs = $element.find(this.classes.typographyInput);
                var currentTypography = {};

                currentTypography.selector = selector;
                currentTypography.type = type;
                currentTypography.properties = {};
                currentTypography.breakpoints = {};

                inputs.each(function(index, element) {
                    var $input = $(element);
                    var property = $input.attr('data-edit');
                    var value = $input.attr('data-breakpoint-default');
                    currentTypography.properties[property] = value;

                    for (var index in currentJSON.breakpoints) {
                        var breakpoint = currentJSON.breakpoints[index].name;
                        var breakpointValue = $input.attr('data-breakpoint-' + breakpoint);
                        if (breakpointValue !== undefined) {
                            currentTypography.breakpoints[breakpoint] = currentTypography.breakpoints[breakpoint] || {};
                            currentTypography.breakpoints[breakpoint][property] = breakpointValue;
                        }
                    }
                });

                currentJSON.typography.push(currentTypography);
            }, this));

            currentJSON.lastUpdated = new Date().getTime();

            return currentJSON;
        },

        loadJSON: function() {
            this.manager.getJSON($.proxy(this.loadTypography, this));
        },

        updateLocalJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.saveLocalJSON(currentJSON);
        },

        generateJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.updateJSON(currentJSON);
        },

        importJSON: function() {
            var importJSON = this.manager.getImportJSON();

            if (importJSON) {
                this.loadTypography(importJSON);
                this.updateLocalJSON();
            }
        },

        downloadJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.downloadJSON(currentJSON);
        }

    });

    $.fn.templatesTypography = function(options) {
        return this.each(function() {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('templatesTypography')) return;

            // pass options to plugin constructor
            var templatesTypography = new TemplatesTypography(this, options);

            // Store plugin object in this element's data
            element.data('templatesTypography', templatesTypography);
        });
    };
})(jQuery);

(function($) {
    var TemplatesBreakpoints = function(element, options) {
        this.templatesBreakpoints = $(element);
        this.manager = new TemplatesManager();

        // Default module configuration
        this.defaults = {
            classes: {
                container: '.template-breakpoints-wrapper',
                grid: '.template-breakpoints-grid',
                template: '.template-breakpoint.is-template',
                addButton: '.btn-add-breakpoint',
                preview: '.template-breakpoint',
                previewGridElement: '.template-breakpoint-grid-element',
                previewName: '.template-breakpoint-name',
                previewMin: '.template-breakpoint-min',
                previewMinActivate: '.template-breakpoint-min-activate',
                previewMax: '.template-breakpoint-max',
                previewMaxActivate: '.template-breakpoint-max-activate',
                previewAdjustableInput: '.template-breakpoint-adjustable',
                previewDeleteButton: '.btn-remove-breakpoint'
            }
        };

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, window.project.classes || {});

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        this.$container = $(this.classes.container);
        this.$template = $(this.classes.template);
        this.$grid = $(this.classes.grid);
        this.$addButton = $(this.classes.addButton);

        this.biggestBreakpoint;

        this.init();
    };

    $.extend(TemplatesBreakpoints.prototype, {

        init: function() {
            this.bindEvents();
            this.loadJSON();
        },

        bindEvents: function() {
            this.$addButton.on('click', $.proxy(function() {
                this.createBreakpointPreview({
                    name: 'Custom',
                    min: '480px',
                    max: '1600px'
                }, true);
            }, this));

            $(document).on('change', this.classes.previewMinActivate, $.proxy(function(event) {
                var $input = $(event.currentTarget).next(this.classes.previewMin);
                if ($input.attr('disabled')) {
                    $input.removeAttr('disabled');
                } else {
                    $input.val('');
                    $input.attr('disabled', 'disabled');
                }
                this.updateBreakpointPositions();
            }, this));

            $(document).on('change', this.classes.previewMaxActivate, $.proxy(function(event) {
                var $input = $(event.currentTarget).next(this.classes.previewMax);
                if ($input.attr('disabled')) {
                    $input.removeAttr('disabled');
                } else {
                    $input.val('');
                    $input.attr('disabled', 'disabled');
                }
                this.updateBreakpointPositions();
            }, this));

            $(document).on('keydown', this.classes.previewAdjustableInput, $.proxy(function(event) {
                var variance = 0;
                var $element = $(event.currentTarget);

                if (event.keyCode === 16) { // Shift
                    this.isShiftPressed = true;
                } else if (event.keyCode === 18) { // Alt
                    this.isAltPressed = true;
                } else if (event.keyCode === 38) { // Up arrow
                    variance = 1;
                    this.adjustInputValue($element, variance);
                } else if (event.keyCode === 40) { // Down arrow
                    variance = -1;
                    this.adjustInputValue($element, variance);
                }
            }, this));

            $(document).on('mousewheel', this.classes.previewAdjustableInput + '[type="text"]', $.proxy(function(event) {
                var variance = (event.originalEvent.wheelDelta > 0 ? 1 : -1);
                var $element = $(event.currentTarget);

                if (!$element.is(':disabled')) this.adjustInputValue($element, variance);
                event.preventDefault();
            }, this));

            $(document).on('keyup', this.classes.previewAdjustableInput, $.proxy(function(event) {
                if (event.keyCode === 16) this.isShiftPressed = false;
                if (event.keyCode === 18) this.isAltPressed = false;
            }, this));

            this.manager.$generateButton.on('click', $.proxy(this.generateJSON, this));
            this.manager.$importButton.on('click', $.proxy(this.importJSON, this));
            this.manager.$downloadButton.on('click', $.proxy(this.downloadJSON, this));
        },

        loadJSON: function() {
            this.manager.getJSON($.proxy(this.loadBreakpoints, this));
        },

        loadBreakpoints: function(data) {
            this.$container.find(this.classes.preview).remove();
            this.updateMaxBreakpoint();

            for (var index in data.breakpoints) {
                this.createBreakpointPreview(data.breakpoints[index], false);
            }

            this.updateGrid();
            this.manager.finishLoading();
        },

        createBreakpointPreview: function(breakpoint, editable) {
            var $element = this.$template.clone().removeClass('is-template');
            var $previewName = $element.find(this.classes.previewName);
            var $previewMin = $element.find(this.classes.previewMin);
            var $previewMinActivate = $element.find(this.classes.previewMinActivate);
            var $previewMax = $element.find(this.classes.previewMax);
            var $previewMaxActivate = $element.find(this.classes.previewMaxActivate);
            var $deleteButton = $element.find(this.classes.previewDeleteButton);

            $previewName.val(breakpoint.name);

            if (breakpoint.min === 'null') {
                $previewMin.attr('disabled', 'disabled');
            } else {
                $previewMin.val(breakpoint.min);
                $previewMinActivate.attr('checked', 'checked');
            }

            if (breakpoint.max === 'null') {
                $previewMax.attr('disabled', 'disabled');
            } else {
                $previewMax.val(breakpoint.max);
                $previewMaxActivate.attr('checked', 'checked');
            }

            if (!editable) {
                $deleteButton.hide();
                $element.find(this.classes.previewName).attr('readonly', 'true');
            } else {
                $element.addClass('is-new');
                $deleteButton.on('click', $.proxy(function(event) {
                    this.deleteBreakpointPreview($element);
                }, this));
            }

            $previewMin.add($previewMax).on('change', $.proxy(function(event) {
                this.updateBreakpointPositions();
                this.updateGrid();
            }, this));

            $previewName.add($previewMin).add($previewMax).on('change', $.proxy(function(event) {
                this.updateLocalJSON();
            }, this));

            this.setBreakpointPosition($element, breakpoint);
            this.$container.append($element);
        },

        setBreakpointPosition: function($element, breakpoint) {
            var min = 0;
            var max = parseInt(this.biggestBreakpoint.max);
            var bpMin = parseInt(breakpoint.min);
            var bpMax = parseInt(breakpoint.max);
            var $previews = this.$container.find(this.classes.preview);
            var height = $previews.length > 0 ? $previews.eq(0).outerHeight() : 'auto';

            if (max < 1920) max = 1920;
            if (breakpoint.min === 'null') bpMin = 0;
            if (breakpoint.max === 'null') bpMax = max;

            var left = (bpMin - min) / max * 100;
            var width = (bpMax - bpMin) / max * 100;
            var top = $previews.length * height;

            $element.css({
                left: left + '%',
                width: width + '%',
                top: top + 'px'
            });

            this.$container.css('height', ($previews.length + 1) * height);
        },

        updateBreakpointPositions: function() {
            this.updateMaxBreakpoint();
            var min = 0;
            var max = parseInt(this.biggestBreakpoint.max);
            var $previews = this.$container.find(this.classes.preview);
            var height = $previews.eq(0).outerHeight(true);

            $previews.each($.proxy(function(index, element) {
                var $element = $(element);
                var bpMin = parseInt($element.find(this.classes.previewMin).val());
                var bpMax = parseInt($element.find(this.classes.previewMax).val());

                if (max < 1920) max = 1920;
                if (isNaN(bpMin)) bpMin = 0;
                if (isNaN(bpMax)) bpMax = max;

                var left = (bpMin - min) / max * 100;
                var width = (bpMax - bpMin) / max * 100;
                var top = index * height;

                $element.css({
                    left: left + '%',
                    width: width + '%',
                    top: top + 'px'
                });
            }, this));

            this.$container.css('height', ($previews.length) * height);
            this.updateLocalJSON();
        },

        updateBreakpointPreview: function($preview, breakpoint) {
            $preview.find(this.classes.previewName).val(breakpoint.name);
            $preview.find(this.classes.previewMin).val(breakpoint.min);
            $preview.find(this.classes.previewMax).val(breakpoint.max);

            this.updateLocalJSON();
            this.updateMaxBreakpoint();
        },

        deleteBreakpointPreview: function($preview) {
            $preview.remove();
            this.updateBreakpointPositions();
            this.updateLocalJSON();
        },

        updateGrid: function() {
            var min = 0;
            var max = parseInt(this.biggestBreakpoint.max);

            if (max < 1920) max = 1920;

            this.$grid.find(this.classes.previewGridElement).remove();

            for (var i = 0; i < max / 100; i++) {
                var $element = $('<div class="' + this.classes.previewGridElement.replace('.', '') + '"></div>');
                $element.css('left', i * 100 / max * 100 + '%');
                $element.attr('data-label', i * 100);
                this.$grid.append($element);
            }
        },

        adjustInputValue: function($element, variance) {
            if (this.isShiftPressed) variance = variance * 10;
            if (this.isAltPressed) variance = variance * 0.10;

            var initialValue = $element.val();
            var matches = initialValue.match(/(.*\d+)(.+)/);
            var value = parseFloat((matches !== null ? matches[1] : 0));
            var unit = (matches !== null ? matches[2] : 'px');
            var newValue = (value * 1000 + variance * 1000) / 1000;

            if (newValue <= 0) {
                newValue = 0;
                unit = '';
            }

            $element.val(newValue + unit);
            $element.trigger('change');
        },

        updateMaxBreakpoint: function() {
            var currentJSON = this.biggestBreakpoint === undefined ? this.manager.getJSON() : this.getNewJSON();
            this.biggestBreakpoint = currentJSON.breakpoints[0];

            for (var index in currentJSON.breakpoints) {
                var currentBreakpoint = currentJSON.breakpoints[index];
                if (parseInt(currentBreakpoint.max) > parseInt(this.biggestBreakpoint.max)) {
                    this.biggestBreakpoint = currentBreakpoint;
                }
            }
        },

        getNewJSON: function() {
            var currentJSON = this.manager.getJSON();
            var breakpoints = this.$container.find(this.classes.preview);

            currentJSON.breakpoints = [];

            breakpoints.each($.proxy(function(index, element) {
                var $element = $(element);
                var name = $element.find(this.classes.previewName).val();
                var min = $element.find(this.classes.previewMin).val();
                var max = $element.find(this.classes.previewMax).val();

                if (min === '') min = 'null';
                if (max === '') max = 'null';

                currentJSON.breakpoints.push({
                    name: name,
                    min: min,
                    max: max
                });
            }, this));

            currentJSON.lastUpdated = new Date().getTime();

            return currentJSON;
        },

        updateLocalJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.saveLocalJSON(currentJSON);
        },

        generateJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.updateJSON(currentJSON);
        },

        importJSON: function() {
            var importJSON = this.manager.getImportJSON();

            if (importJSON) {
                this.loadBreakpoints(importJSON);
                this.updateLocalJSON();
            }
        },

        downloadJSON: function() {
            var currentJSON = this.getNewJSON();

            this.manager.downloadJSON(currentJSON);
        }
    });

    $.fn.templatesBreakpoints = function(options) {
        return this.each(function() {
            var element = $(this);

            if (element.data('templatesBreakpoints')) return;

            var templatesBreakpoints = new TemplatesBreakpoints(this, options);
            element.data('templatesBreakpoints', templatesBreakpoints);
        });
    };
})(jQuery);
