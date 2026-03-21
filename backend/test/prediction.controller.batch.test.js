const { expect } = require('chai');
const sinon = require('sinon');
const { batchUpsert } = require('../src/controllers/prediction.controller');
const { Prediction, Match } = require('../src/models');

describe('Prediction Controller - FUNC-026a: Batch Upsert', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/predictions/batch', () => {
    it('debería guardar múltiples pronósticos nuevos exitosamente', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 2, predicted_away: 1 },
            { match_id: 2, predicted_home: 1, predicted_away: 1 },
            { match_id: 3, predicted_home: 3, predicted_away: 0 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatches = [
        { id: 1, status: 'scheduled' },
        { id: 2, status: 'scheduled' },
        { id: 3, status: 'scheduled' },
      ];

      sinon.stub(Match, 'findAll').resolves(mockMatches);
      sinon.stub(Prediction, 'findAll').resolves([]);
      sinon.stub(Prediction, 'create')
        .onFirstCall().resolves({ id: 1, match_id: 1, predicted_home: 2, predicted_away: 1 })
        .onSecondCall().resolves({ id: 2, match_id: 2, predicted_home: 1, predicted_away: 1 })
        .onThirdCall().resolves({ id: 3, match_id: 3, predicted_home: 3, predicted_away: 0 });

      await batchUpsert(req, res);

      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.saved).to.equal(3);
      expect(response.created).to.equal(3);
      expect(response.updated).to.equal(0);
      expect(response.message).to.include('3 pronósticos guardados');
    });

    it('debería actualizar pronósticos existentes', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 3, predicted_away: 2 },
            { match_id: 2, predicted_home: 0, predicted_away: 0 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatches = [
        { id: 1, status: 'scheduled' },
        { id: 2, status: 'scheduled' },
      ];

      const existingPred1 = {
        id: 10,
        match_id: 1,
        predicted_home: 2,
        predicted_away: 1,
        save: sinon.stub().resolves(),
      };

      const existingPred2 = {
        id: 11,
        match_id: 2,
        predicted_home: 1,
        predicted_away: 1,
        save: sinon.stub().resolves(),
      };

      sinon.stub(Match, 'findAll').resolves(mockMatches);
      sinon.stub(Prediction, 'findAll').resolves([existingPred1, existingPred2]);

      await batchUpsert(req, res);

      expect(existingPred1.predicted_home).to.equal(3);
      expect(existingPred1.predicted_away).to.equal(2);
      expect(existingPred2.predicted_home).to.equal(0);
      expect(existingPred2.predicted_away).to.equal(0);
      expect(existingPred1.save.calledOnce).to.be.true;
      expect(existingPred2.save.calledOnce).to.be.true;

      const response = res.json.firstCall.args[0];
      expect(response.saved).to.equal(2);
      expect(response.updated).to.equal(2);
      expect(response.created).to.equal(0);
    });

    it('debería rechazar array vacío de pronósticos', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: { predictions: [] }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await batchUpsert(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error');
    });

    it('debería rechazar pronósticos con campos faltantes', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 2 }, // Falta predicted_away
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await batchUpsert(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('debe tener match_id, predicted_home y predicted_away');
    });

    it('debería rechazar goles negativos', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: -1, predicted_away: 2 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await batchUpsert(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('enteros no negativos');
    });

    it('debería rechazar si algún partido no existe', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 2, predicted_away: 1 },
            { match_id: 999, predicted_home: 1, predicted_away: 1 }, // No existe
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      // Solo devuelve 1 partido de los 2 solicitados
      sinon.stub(Match, 'findAll').resolves([{ id: 1, status: 'scheduled' }]);

      await batchUpsert(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.equal('Algunos partidos no existen');
    });

    it('debería rechazar pronósticos de partidos ya jugados', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 2, predicted_away: 1 },
            { match_id: 2, predicted_home: 1, predicted_away: 1 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatches = [
        { id: 1, status: 'played' }, // Jugado
        { id: 2, status: 'scheduled' },
      ];

      sinon.stub(Match, 'findAll').resolves(mockMatches);

      await batchUpsert(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('partidos ya jugados');
      expect(res.json.firstCall.args[0].played_match_ids).to.deep.equal([1]);
    });

    it('debería manejar creación y actualización mixta', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 2, predicted_away: 1 }, // Nuevo
            { match_id: 2, predicted_home: 1, predicted_away: 1 }, // Existente
            { match_id: 3, predicted_home: 0, predicted_away: 0 }, // Nuevo
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatches = [
        { id: 1, status: 'scheduled' },
        { id: 2, status: 'scheduled' },
        { id: 3, status: 'scheduled' },
      ];

      const existingPred = {
        id: 10,
        match_id: 2,
        predicted_home: 3,
        predicted_away: 2,
        save: sinon.stub().resolves(),
      };

      sinon.stub(Match, 'findAll').resolves(mockMatches);
      sinon.stub(Prediction, 'findAll').resolves([existingPred]);
      sinon.stub(Prediction, 'create')
        .onFirstCall().resolves({ id: 1, match_id: 1 })
        .onSecondCall().resolves({ id: 2, match_id: 3 });

      await batchUpsert(req, res);

      const response = res.json.firstCall.args[0];
      expect(response.saved).to.equal(3);
      expect(response.created).to.equal(2);
      expect(response.updated).to.equal(1);
    });

    it('debería manejar errores de base de datos', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 2, predicted_away: 1 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(Match, 'findAll').rejects(new Error('Database error'));

      await batchUpsert(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error');
    });
  });
});
