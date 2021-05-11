import {DialogUtils} from '../../src/utils/dialog-utils';
import SpyObj = jasmine.SpyObj;
import {RandomUtils} from '../../src/utils/random-utils';
import createSpyObj = jasmine.createSpyObj;

describe('DialogUtils', () => {
  let mockRandomUtils: SpyObj<RandomUtils>;
  let dialogUtils: DialogUtils;

  beforeEach(() => {
    mockRandomUtils = createSpyObj('mockRandomUtil', ['chooseRandomString']);
    dialogUtils = new DialogUtils(mockRandomUtils);
  });

  describe('makeRobotNoise', () => {
    it('should choose and italicize the robot noise returned from RandomUtil.chooseRandomString', () => {
      mockRandomUtils.chooseRandomString.and.callFake(robotNoises => robotNoises[0]);
      const robotNoise = dialogUtils.makeRobotNoise();
      expect(robotNoise).toEqual('_Beep._');
    });
  });
});
