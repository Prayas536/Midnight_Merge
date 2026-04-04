import pyTigerGraph as tg
import traceback

class MyTG(tg.TigerGraphConnection):
    def __init__(self, *args, **kwargs):
        self._cached_token_auth = None
        self._cached_pwd_auth = None
        super().__init__(*args, **kwargs)

try:
    conn = MyTG(host='https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io', graphname='NexusHealthGraph', username='tigergraph', password='tigergraph')
    print("Subclass Connection established!")
except Exception as e:
    print("Init failed:")
    traceback.print_exc()

# Let's try skipping init logic directly!
print("Trying without __init__ call for base class...")
try:
    conn2 = tg.TigerGraphConnection.__new__(tg.TigerGraphConnection)
    conn2.host = 'https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io'
    conn2.graphname = 'NexusHealthGraph'
    conn2.username = 'tigergraph'
    conn2.password = 'tigergraph'
    conn2.apiToken = None
    conn2._cached_token_auth = None
    conn2._cached_pwd_auth = None
    conn2.gsqlVersion = "3.0.0"
    conn2.gsPort = 14240
    conn2.restppPort = 9000
    conn2.sslPort = 443
    conn2.useCert = True
    conn2.certPath = None
    conn2.debug = False
    conn2.version = '4.2.2'
    conn2.jwtToken = None
    print(conn2.gsql('USE GRAPH NexusHealthGraph\nLS;'))
except Exception as e:
    print("Manual bypass failed:")
    traceback.print_exc()
