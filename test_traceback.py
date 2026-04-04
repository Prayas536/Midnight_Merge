import pyTigerGraph as tg
import traceback

host = 'https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io'
try:
    conn = tg.TigerGraphConnection(host=host, graphname='NexusHealthGraph', username='tigergraph', password='tigergraph')
    print("Connection created!")
    try:
        conn.gsql('USE GRAPH NexusHealthGraph\nLS;')
    except Exception as e:
        print("GSQL Error traceback:")
        traceback.print_exc()
except Exception as e:
    print("Init Error traceback:")
    traceback.print_exc()
