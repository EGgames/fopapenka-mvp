const { expect } = require('chai');
const sinon = require('sinon');
const { getInviteCode } = require('../src/controllers/penca.controller');
const { Penca } = require('../src/models');

describe('Penca Controller - FUNC-002b: Obtener código de invitación', () => {
  afterEach(() => { sinon.restore(); });

  describe('GET /api/pencas/invite-code', () => {
    it('debería devolver el código de invitación actual de la penca', async () => {
      const req = { user: { userId: 1, pencaId: 10, role: 'admin' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Penca, 'findByPk').resolves({ invite_code: 'ABC123XY' });

      await getInviteCode(req, res);

      expect(Penca.findByPk.calledWith(10, { attributes: ['invite_code'] })).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ invite_code: 'ABC123XY' });
    });

    it('debería devolver 404 si la penca no existe', async () => {
      const req = { user: { userId: 1, pencaId: 999, role: 'admin' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Penca, 'findByPk').resolves(null);

      await getInviteCode(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error');
    });

    it('debería manejar errores del servidor', async () => {
      const req = { user: { userId: 1, pencaId: 10, role: 'admin' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Penca, 'findByPk').rejects(new Error('DB down'));

      await getInviteCode(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
