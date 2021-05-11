import {RandomUtils} from '../../src/utils/random-utils';

describe('RandomUtils', () => {
  let randomUtils: RandomUtils;

  beforeEach(() => {
    randomUtils = new RandomUtils();
  });

  describe('chooseRandomString', () => {
    let possibleStrings: string[];

    beforeEach(() => {
      possibleStrings = ['one', 'two', 'three', 'four'];
    });

    it('should choose the correct message if the minimum random number is generated', () => {
      spyOn(randomUtils, 'generateRandomNumber').and.returnValue(0);
      const message = randomUtils.chooseRandomString(possibleStrings);
      expect(message).toEqual('one');
    });

    it('should choose the correct message if the maximum random number is generated', () => {
      spyOn(randomUtils, 'generateRandomNumber').and.returnValue(.999999);
      const message = randomUtils.chooseRandomString(possibleStrings);
      expect(message).toEqual('four');
    });

    it('should choose the correct message if a random number between the minimum and maximum is generated', () => {
      spyOn(randomUtils, 'generateRandomNumber').and.returnValue(.54);
      const message = randomUtils.chooseRandomString(possibleStrings);
      expect(message).toEqual('three');
    });
  });
});
