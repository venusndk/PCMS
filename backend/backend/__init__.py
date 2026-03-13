import pymysql
pymysql.install_as_MySQLdb()

# Override version to satisfy Django's mysqlclient >= 2.2.1 requirement
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.VERSION = (2, 2, 1)
