const { expect } = require('chai');
const sinon = require('sinon');
const { regenerateCode } = require('../src/controllers/penca.controller');
const { Penca } = require('../src/models');

describe('Penca Controller - FUNC-002: Regenerar código de invitación', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/pencas/regenerate-code', () => {
    it('debería generar un nuevo código único y actualizar la penca', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'admin' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockPenca = {
        id: 10,
        name: 'Penca Test',
        invite_code: 'OLDCODE',
        save: sinon.stub().resolves(),
      };

      sinon.stub(Penca, 'findByPk').resolves(mockPenca);
      sinon.stub(Penca, 'findOne')
        .onFirstCall().resolves(null) // Primera búsqueda: código disponible
        .onSecondCall().resolves(null);

      await regenerateCode(req, res);

      expect(Penca.findByPk.calledWith(10)).to.be.true;
      expect(mockPenca.save.calledOnce).to.be.true;
      expect(mockPenca.invite_code).to.not.equal('OLDCODE');
      expect(mockPenca.invite_code).to.have.lengthOf.at.least(6);
      
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('invite_code');
      expect(response.invite_code).to.equal(mockPenca.invite_code);
    });

    it('debería reintentar si el código generado ya existe', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'admin' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockPenca = {
        id: 10,
        name: 'Penca Test',
        invite_code: 'OLDCODE',
        save: sinon.stub().resolves(),
      };

      sinon.stub(Penca, 'findByPk').resolves(mockPenca);
      
      // Simular colisión: primer código existe, segundo está disponible
      sinon.stub(Penca, 'findOne')
        .onFirstCall().resolves({ id: 99, invite_code: 'COLLISION' }) // Colisión
        .onSecondCall().resolves(null); // Código disponible

      await regenerateCode(req, res);

      expect(Penca.findOne.callCount).to.be.at.least(2);
      expect(mockPenca.save.calledOnce).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('debería devolver error 404 si la penca no existe', async () => {
      const req = {
        user: { userId: 1, pencaId: 999, role: 'admin' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(Penca, 'findByPk').resolves(null);

      await regenerateCode(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ error: 'Penca no encontrada' });
    });

    it('debería generar códigos alfanuméricos en mayúsculas', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'admin' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockPenca = {
        id: 10,
        invite_code: 'OLD',
        save: sinon.stub().resolves(),
      };

      sinon.stub(Penca, 'findByPk').resolves(mockPenca);
      sinon.stub(Penca, 'findOne').resolves(null);

      await regenerateCode(req, res);

      const newCode = mockPenca.invite_code;
      expect(newCode).to.match(/^[A-Z0-9]+$/); // Solo mayúsculas y números
      expect(newCode.length).to.be.at.least(6).and.at.most(8);
    });

    it('debería manejar errores de base de datos', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'admin' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(Penca, 'findByPk').rejects(new Error('Database connection failed'));

      await regenerateCode(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error');
    });
  });

  describe('Seguridad: Auditoría de cambios de código', () => {
    it('debería actualizar el código sin afectar otros campos de la penca', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'admin' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockPenca = {
        id: 10,
        name: 'Penca Original',
        invite_code: 'OLD123',
        created_by: 1,
        status: 'active',
        save: sinon.stub().resolves(),
      };

      const originalName = mockPenca.name;
      const originalCreatedBy = mockPenca.created_by;
      const originalStatus = mockPenca.status;

      sinon.stub(Penca, 'findByPk').resolves(mockPenca);
      sinon.stub(Penca, 'findOne').resolves(null);

      await regenerateCode(req, res);

      // Verificar que solo el código cambió
      expect(mockPenca.name).to.equal(originalName);
      expect(mockPenca.created_by).to.equal(originalCreatedBy);
      expect(mockPenca.status).to.equal(originalStatus);
      expect(mockPenca.invite_code).to.not.equal('OLD123');
    });
  });
});
