#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def patch_django_for_python_314():
    """
    Monkeypatch Django 4.2.x to fix Python 3.14 compatibility issues.
    Specifically fixes 'AttributeError: super object has no attribute dicts'
    in django.template.context.BaseContext.__copy__.
    """
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


def main():
    """Run administrative tasks."""
    patch_django_for_python_314()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
