# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )
Rails.application.config.assets.precompile += %w( _bootstrap.min.css bootstrap-responsive.min.css datepicker.css bootstrap-wysihtml5.css bootstrap-timepicker.css print.css style.css)
Rails.application.config.generators do |g|
  g.test_framework :mini_test, :spec => true, :fixture => false
end
#Rails.application.config.requirejs.logical_asset_filter += [/\.hbs$/]
#Rails.application.config.requirejs.amd_wrap_template = "define(function(require,exports,module) {\n%s\n;});\n"


