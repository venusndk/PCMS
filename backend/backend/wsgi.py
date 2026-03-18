import os
from django.core.wsgi import get_wsgi_application

def patch_django_for_python_314():
    try:
        from django.template import context
        def patched_copy(self):
            duplicate = self.__class__.__new__(self.__class__)
            duplicate.__dict__.update(self.__dict__)
            if hasattr(self, 'dicts'):
                duplicate.dicts = self.dicts[:]
            return duplicate
        context.BaseContext.__copy__ = patched_copy
    except (ImportError, AttributeError):
        pass

patch_django_for_python_314()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
application = get_wsgi_application()
