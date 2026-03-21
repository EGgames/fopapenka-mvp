const { expect } = require('chai');
const sinon = require('sinon');
const { getMyPencas, logout } = require('../src/controllers/auth.controller');
const { User, Penca, PencaMembership } = require('../src/models');

describe('Auth Controller - Nuevas funcionalidades', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  describe('GET /api/auth/me/pencas - FUNC-006', () => {
    it('debería devolver lista de pencas del usuario autenticado', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMemberships = [
        {
          Penca: {
            id: 10,
            name: 'Penca Amigos',
            invite_code: 'AMIGOS2026',
            created_at: new Date('2026-01-01'),
          },
          role: 'player',
          created_at: new Date('2026-01-02'),
          updated_at: new Date('2026-03-20'),
        },
        {
          Penca: {
            id: 20,
            name: 'Penca Familia',
            invite_code: 'FAMILIA26',
            created_at: new Date('2026-01-05'),
          },
          role: 'admin',
          created_at: new Date('2026-01-05'),
          updated_at: new Date('2026-03-15'),
        },
      ];

      sinon.stub(PencaMembership, 'findAll').resolves(mockMemberships);

      await getMyPencas(req, res);

      expect(PencaMembership.findAll.calledOnce).to.be.true;
      expect(PencaMembership.findAll.firstCall.args[0]).to.deep.include({
        where: { user_id: 1, status: 'active' },
      });
      
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.pencas).to.be.an('array');
      expect(response.pencas).to.have.lengthOf(2);
      expect(response.pencas[0]).to.include({
        id: 10,
        name: 'Penca Amigos',
        invite_code: 'AMIGOS2026',
        role: 'player',
      });
    });

    it('debería devolver array vacío si el usuario no tiene pencas activas', async () => {
      const req = {
        user: { userId: 99, pencaId: null, role: null }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(PencaMembership, 'findAll').resolves([]);

      await getMyPencas(req, res);

      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.pencas).to.be.an('array');
      expect(response.pencas).to.have.lengthOf(0);
    });

    it('debería manejar errores del servidor', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(PencaMembership, 'findAll').rejects(new Error('Database error'));

      await getMyPencas(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error');
    });
  });

  describe('POST /api/auth/logout - FUNC-007', () => {
    it('debería confirmar cierre de sesión exitoso', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await logout(req, res);

      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('message');
      expect(response.message).to.equal('Sesión cerrada exitosamente');
    });

    it('debería manejar errores inesperados', async () => {
      const req = {
        user: null, // Simular fallo inesperado
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await logout(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error');
    });
  });

  describe('Integración: Flujo completo de multi-penca', () => {
    it('debería permitir al usuario ver sus pencas después de registrarse en múltiples', async () => {
      const req = {
        user: { userId: 5, pencaId: 1, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMemberships = [
        {
          Penca: { id: 1, name: 'Penca A', invite_code: 'PENCA_A', created_at: new Date() },
          role: 'player',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          Penca: { id: 2, name: 'Penca B', invite_code: 'PENCA_B', created_at: new Date() },
          role: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          Penca: { id: 3, name: 'Penca C', invite_code: 'PENCA_C', created_at: new Date() },
          role: 'player',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      sinon.stub(PencaMembership, 'findAll').resolves(mockMemberships);

      await getMyPencas(req, res);

      const response = res.json.firstCall.args[0];
      expect(response.pencas).to.have.lengthOf(3);
      
      // Verificar que cada penca tenga los campos correctos
      response.pencas.forEach(penca => {
        expect(penca).to.have.all.keys('id', 'name', 'invite_code', 'role', 'joined_at', 'last_access');
      });

      // Verificar que haya al menos un admin y un player
      const adminPencas = response.pencas.filter(p => p.role === 'admin');
      const playerPencas = response.pencas.filter(p => p.role === 'player');
      expect(adminPencas).to.have.lengthOf.at.least(1);
      expect(playerPencas).to.have.lengthOf.at.least(1);
    });
  });
});
