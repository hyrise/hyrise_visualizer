HYRISE_CONFIG = YAML.load_file("#{Rails.root}/config/hyrise.yml")

Visualizer::Application.config.hyrise = HYRISE_CONFIG
