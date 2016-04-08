import os
from lib.conf import settings

bind = "127.0.0.1:4567"
workers = 2 #multiprocessing.cpu_count() * 2 + 1
preload_app = True
daemon = settings.DAEMON
pidfile = os.path.normpath(os.path.join(os.path.dirname(__file__),'gunicorn.pid'))
accesslog = os.path.normpath(os.path.join(os.path.dirname(__file__),'access.log'))
errorlog = os.path.normpath(os.path.join(os.path.dirname(__file__),'error.log'))
loglevel = 'info'
