const { expect } = require('chai');
const sinon = require('sinon');
const { markRead, unreadCount } = require('../src/controllers/chat.controller');
const { ChatMessage, ChatReadCursor } = require('../src/models');

describe('Chat Controller - Notificaciones (markRead / unreadCount)', () => {

  afterEach(() => {
    sinon.restore();
  });

  /* ─── MARK READ ─────────────────────────────────────────── */
  describe('PUT /api/chat/read (markRead)', () => {
    it('debería marcar como leído el último mensaje', async () => {
      const req = {
        user: { userId: 1, pencaId: 10 },
        body: { last_read_message_id: 42 },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(ChatReadCursor, 'upsert').resolves();

      await markRead(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0].success).to.be.true;
      expect(ChatReadCursor.upsert.calledOnce).to.be.true;

      const upsertArgs = ChatReadCursor.upsert.firstCall.args[0];
      expect(upsertArgs.user_id).to.equal(1);
      expect(upsertArgs.penca_id).to.equal(10);
      expect(upsertArgs.last_read_message_id).to.equal(42);
    });

    it('debería manejar errores del servidor', async () => {
      const req = {
        user: { userId: 1, pencaId: 10 },
        body: { last_read_message_id: 42 },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(ChatReadCursor, 'upsert').rejects(new Error('DB error'));

      await markRead(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  /* ─── UNREAD COUNT ──────────────────────────────────────── */
  describe('GET /api/chat/unread (unreadCount)', () => {
    it('debería devolver la cantidad de mensajes no leídos', async () => {
      const req = { user: { userId: 1, pencaId: 10 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(ChatReadCursor, 'findOne').resolves({ last_read_message_id: 10 });
      sinon.stub(ChatMessage, 'count').resolves(5);

      await unreadCount(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0].unread).to.equal(5);

      // Verificar que count filtra por id > 10 y excluye mensajes propios
      const countWhere = ChatMessage.count.firstCall.args[0].where;
      expect(countWhere.penca_id).to.equal(10);
    });

    it('debería devolver todos los mensajes como no leídos si no hay cursor', async () => {
      const req = { user: { userId: 1, pencaId: 10 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(ChatReadCursor, 'findOne').resolves(null);
      sinon.stub(ChatMessage, 'count').resolves(15);

      await unreadCount(req, res);

      expect(res.json.firstCall.args[0].unread).to.equal(15);
    });

    it('debería devolver 0 si no hay mensajes nuevos', async () => {
      const req = { user: { userId: 1, pencaId: 10 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(ChatReadCursor, 'findOne').resolves({ last_read_message_id: 50 });
      sinon.stub(ChatMessage, 'count').resolves(0);

      await unreadCount(req, res);

      expect(res.json.firstCall.args[0].unread).to.equal(0);
    });

    it('debería manejar errores del servidor', async () => {
      const req = { user: { userId: 1, pencaId: 10 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(ChatReadCursor, 'findOne').rejects(new Error('DB error'));

      await unreadCount(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
