const { expect } = require('chai');
const sinon = require('sinon');
const { byMatch } = require('../src/controllers/prediction.controller');
const { Prediction, Match, User, Score } = require('../src/models');

describe('Prediction Controller - FUNC-023: Ver pronósticos de otros', () => {
  afterEach(() => { sinon.restore(); });

  describe('GET /api/predictions/match/:matchId', () => {
    it('debería devolver pronósticos de todos los usuarios para un partido jugado', async () => {
      const req = { user: { pencaId: 10 }, params: { matchId: '5' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({ id: 5, status: 'played' });
      const mockPredictions = [
        { id: 1, predicted_home: 2, predicted_away: 1, User: { id: 1, nickname: 'Juan' }, Score: { points: 3 } },
        { id: 2, predicted_home: 1, predicted_away: 0, User: { id: 2, nickname: 'Pedro' }, Score: { points: 1 } },
        { id: 3, predicted_home: 0, predicted_away: 3, User: { id: 3, nickname: 'Ana' }, Score: { points: 0 } },
      ];
      sinon.stub(Prediction, 'findAll').resolves(mockPredictions);

      await byMatch(req, res);

      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.predictions).to.have.lengthOf(3);
      expect(response.predictions[0].User.nickname).to.equal('Juan');
      expect(response.predictions[0].Score.points).to.equal(3);
    });

    it('debería rechazar con 403 si el partido no fue jugado', async () => {
      const req = { user: { pencaId: 10 }, params: { matchId: '5' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({ id: 5, status: 'scheduled' });

      await byMatch(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('solo son visibles');
    });

    it('debería devolver 404 si el partido no existe', async () => {
      const req = { user: { pencaId: 10 }, params: { matchId: '999' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves(null);

      await byMatch(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it('debería filtrar por penca_id del usuario', async () => {
      const req = { user: { pencaId: 10 }, params: { matchId: '5' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({ id: 5, status: 'played' });
      sinon.stub(Prediction, 'findAll').resolves([]);

      await byMatch(req, res);

      const findAllArgs = Prediction.findAll.firstCall.args[0];
      expect(findAllArgs.where.penca_id).to.equal(10);
      expect(findAllArgs.where.match_id).to.equal('5');
    });

    it('debería incluir User y Score en los resultados', async () => {
      const req = { user: { pencaId: 10 }, params: { matchId: '5' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({ id: 5, status: 'played' });
      sinon.stub(Prediction, 'findAll').resolves([]);

      await byMatch(req, res);

      const findAllArgs = Prediction.findAll.firstCall.args[0];
      const modelNames = findAllArgs.include.map(i => i.model);
      expect(modelNames).to.include(User);
      expect(modelNames).to.include(Score);
    });

    it('debería manejar errores del servidor', async () => {
      const req = { user: { pencaId: 10 }, params: { matchId: '5' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').rejects(new Error('DB error'));

      await byMatch(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
