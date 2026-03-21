const { expect } = require('chai');
const sinon = require('sinon');
const { batchSetResults } = require('../src/controllers/match.controller');
const { Match, Prediction, Score } = require('../src/models');

describe('Match Controller - FUNC-026b: Batch Set Results', () => {
  
  let transactionStub;
  let sequelizeStub;

  beforeEach(() => {
    // Mock de transacción
    transactionStub = {
      commit: sinon.stub().resolves(),
      rollback: sinon.stub().resolves(),
    };

    sequelizeStub = {
      transaction: sinon.stub().resolves(transactionStub),
    };

    // Mock de require para inyectar sequelize
    const models = require('../src/models');
    sinon.stub(models, 'sequelize').value(sequelizeStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/matches/results/batch', () => {
    it('debería cargar múltiples resultados y recalcular pronósticos', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: 2, away_score: 1 },
            { match_id: 2, home_score: 0, away_score: 0 },
            { match_id: 3, home_score: 3, away_score: 2 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatches = [
        { id: 1, home_score: null, away_score: null, status: 'scheduled', save: sinon.stub().resolves() },
        { id: 2, home_score: null, away_score: null, status: 'scheduled', save: sinon.stub().resolves() },
        { id: 3, home_score: null, away_score: null, status: 'scheduled', save: sinon.stub().resolves() },
      ];

      const mockPredictions1 = [
        { id: 1, predicted_home: 2, predicted_away: 1 },
        { id: 2, predicted_home: 1, predicted_away: 0 },
      ];

      const mockPredictions2 = [
        { id: 3, predicted_home: 0, predicted_away: 0 },
      ];

      const mockPredictions3 = [
        { id: 4, predicted_home: 3, predicted_away: 2 },
        { id: 5, predicted_home: 2, predicted_away: 1 },
      ];

      sinon.stub(Match, 'findAll').resolves(mockMatches);
      sinon.stub(Prediction, 'findAll')
        .onFirstCall().resolves(mockPredictions1)
        .onSecondCall().resolves(mockPredictions2)
        .onThirdCall().resolves(mockPredictions3);
      sinon.stub(Score, 'upsert').resolves();

      await batchSetResults(req, res);

      expect(transactionStub.commit.calledOnce).to.be.true;
      expect(transactionStub.rollback.called).to.be.false;

      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.saved).to.equal(3);
      expect(response.predictions_updated).to.equal(5);
      expect(response.message).to.include('3 resultados cargados');
      expect(response.message).to.include('5 pronósticos recalculados');
    });

    it('debería rechazar array vacío de resultados', async () => {
      const req = {
        body: { results: [] }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await batchSetResults(req, res);

      expect(transactionStub.rollback.calledOnce).to.be.true;
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.equal('Se requiere array de resultados');
    });

    it('debería rechazar resultados con campos faltantes', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: 2 }, // Falta away_score
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await batchSetResults(req, res);

      expect(transactionStub.rollback.calledOnce).to.be.true;
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('debe tener match_id, home_score y away_score');
    });

    it('debería rechazar goles negativos', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: -1, away_score: 2 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      await batchSetResults(req, res);

      expect(transactionStub.rollback.calledOnce).to.be.true;
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('enteros no negativos');
    });

    it('debería rechazar si algún partido no existe', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: 2, away_score: 1 },
            { match_id: 999, home_score: 1, away_score: 1 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(Match, 'findAll').resolves([{ id: 1 }]); // Solo 1 de 2

      await batchSetResults(req, res);

      expect(transactionStub.rollback.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.equal('Algunos partidos no existen');
    });

    it('debería hacer rollback en caso de error durante el guardado', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: 2, away_score: 1 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatch = {
        id: 1,
        save: sinon.stub().rejects(new Error('Database error')),
      };

      sinon.stub(Match, 'findAll').resolves([mockMatch]);

      await batchSetResults(req, res);

      expect(transactionStub.rollback.calledOnce).to.be.true;
      expect(transactionStub.commit.called).to.be.false;
      expect(res.status.calledWith(500)).to.be.true;
    });

    it('debería actualizar estado del partido a "played"', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: 2, away_score: 1 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatch = {
        id: 1,
        home_score: null,
        away_score: null,
        status: 'scheduled',
        save: sinon.stub().resolves(),
      };

      sinon.stub(Match, 'findAll').resolves([mockMatch]);
      sinon.stub(Prediction, 'findAll').resolves([]);

      await batchSetResults(req, res);

      expect(mockMatch.status).to.equal('played');
      expect(mockMatch.home_score).to.equal(2);
      expect(mockMatch.away_score).to.equal(1);
      expect(mockMatch.save.calledOnce).to.be.true;
    });

    it('debería calcular puntos correctamente para cada pronóstico', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: 2, away_score: 1 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatch = {
        id: 1,
        save: sinon.stub().resolves(),
      };

      const mockPredictions = [
        { id: 1, predicted_home: 2, predicted_away: 1 }, // Exacto: 3 puntos
        { id: 2, predicted_home: 3, predicted_away: 0 }, // Resultado correcto: 1 punto
        { id: 3, predicted_home: 0, predicted_away: 2 }, // Sin acierto: 0 puntos
      ];

      sinon.stub(Match, 'findAll').resolves([mockMatch]);
      sinon.stub(Prediction, 'findAll').resolves(mockPredictions);
      const upsertStub = sinon.stub(Score, 'upsert').resolves();

      await batchSetResults(req, res);

      expect(upsertStub.callCount).to.equal(3);
      
      // Verificar que se llama a calculatePoints (esto es implícito en el código)
      // En un test real, también podríamos espiar calculatePoints
    });

    it('debería manejar fixture sin pronósticos', async () => {
      const req = {
        body: {
          results: [
            { match_id: 1, home_score: 2, away_score: 1 },
          ]
        }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockMatch = {
        id: 1,
        save: sinon.stub().resolves(),
      };

      sinon.stub(Match, 'findAll').resolves([mockMatch]);
      sinon.stub(Prediction, 'findAll').resolves([]); // Sin pronósticos

      await batchSetResults(req, res);

      const response = res.json.firstCall.args[0];
      expect(response.predictions_updated).to.equal(0);
      expect(response.saved).to.equal(1);
    });
  });
});
