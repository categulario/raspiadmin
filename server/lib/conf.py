import os
import re

__all__ = ['settings']

class SettingsLoader:
    def __init__(self):
        ENVIRONMENT     = os.environ.get('RASPIADMIN_ENVIRONMENT', 'local')
        SETTINGS_MODULE = os.environ.get('RASPIADMIN_SETTINGS_MODULE', 'config')

        settings = __import__(SETTINGS_MODULE + '.settings').__getattribute__('settings').__dict__

        # this file's directory
        path = os.path.dirname(os.path.abspath(__file__))

        if os.path.isfile(path+'/../'+SETTINGS_MODULE+'/settings_'+ENVIRONMENT+'.py'):
            overrided = __import__(SETTINGS_MODULE + '.settings_'+ENVIRONMENT).__getattribute__('settings_'+ENVIRONMENT).__dict__
        else:
            overrided = {}

        self.settings = dict()

        for key in settings.keys():
            if re.search('^[A-Z_]+$', key):
                self.settings[key] = overrided.get(key, settings[key])

    def __getitem__(self, key):
        return self.settings.get(key, None)

    def __getattr__(self, key):
        return self.settings.get(key, None)

    def get(self, key, default=None):
        return self.settings.get(key, default)

settings = SettingsLoader()
