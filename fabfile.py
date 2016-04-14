from fabric.api import run, cd, env

env.user  = 'pi'
env.hosts = ['raspberrypi.lan']

def deploy():
    web_dir = '/home/pi/Web'
    with cd(web_dir):
        run("git pull")
        run("bower install")
        run("sudo systemctl restart gunicorn")
