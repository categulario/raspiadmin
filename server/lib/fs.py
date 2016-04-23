
def touch(filename):
	"""
	Creates the file if it does not exists, but does not implement
	a real linux touch, see:
	http://stackoverflow.com/questions/1158076/implement-touch-using-python#1160227
	"""
	with open(filename, 'w'):
		pass

def file_items(item):
	"""
	take a tuple (key, value) and renders something like --key value or
	just --key in the case that value is boolean
	"""
	if item[1] == True:
		return '--%s'%item[0]
	else:
		return '--%s %s'%(item[0], item[1])
