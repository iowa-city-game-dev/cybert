import {DialogUtils} from '../../src/utils/dialog-utils';
import SpyObj = jasmine.SpyObj;
import {RandomUtils} from '../../src/utils/random-utils';
import createSpyObj = jasmine.createSpyObj;

describe('DialogUtils', () => {
  let mockRandomUtils: SpyObj<RandomUtils>;
  let dialogUtils: DialogUtils;

  beforeEach(() => {
    mockRandomUtils = createSpyObj('mockRandomUtil', ['generateRandomNumber']);
    dialogUtils = new DialogUtils(mockRandomUtils);
  });

  describe('chooseRandomMessage', () => {
    let possibleMessages: string[];

    beforeEach(() => {
      possibleMessages = ['one', 'two', 'three', 'four'];
    });

    it('should choose the correct message if the minimum random number is generated', () => {
      mockRandomUtils.generateRandomNumber.and.returnValue(0);
      const message = dialogUtils.chooseRandomMessage(possibleMessages);
      expect(message).toEqual('one');
    });

    it('should choose the correct message if the maximum random number is generated', () => {
      mockRandomUtils.generateRandomNumber.and.returnValue(.999999);
      const message = dialogUtils.chooseRandomMessage(possibleMessages);
      expect(message).toEqual('four');
    });

    it('should choose the correct message if a random number between the minimum and maximum is generated', () => {
      mockRandomUtils.generateRandomNumber.and.returnValue(.54);
      const message = dialogUtils.chooseRandomMessage(possibleMessages);
      expect(message).toEqual('three');
    });
  });

  describe('makeRobotNoise', () => {
    it('should choose and italicize the correct robot noise if the minimum random number is generated', () => {
      mockRandomUtils.generateRandomNumber.and.returnValue(0);
      const robotNoise = dialogUtils.makeRobotNoise();
      expect(robotNoise).toEqual('_Beep._');
    });

    it('should choose and italicize the correct robot noise if the maximum random number is generated', () => {
      mockRandomUtils.generateRandomNumber.and.returnValue(.999999);
      const robotNoise = dialogUtils.makeRobotNoise();
      expect(robotNoise).toEqual('_Ding!_');
    });

    it('should choose and italicize the correct robot noise if a random number between the minimum and maximum is ' +
        'generated', () => {
      mockRandomUtils.generateRandomNumber.and.returnValue(.54);
      const robotNoise = dialogUtils.makeRobotNoise();
      expect(robotNoise).toEqual('_Zip!_');
    });
  });
});
