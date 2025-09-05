// @ts-nocheck

@Event
export class InfluencerRegistered {
  @Indexed influencer: Address;
}

@Event
export class ScoreSet {
  @Indexed scorer;
  @Indexed nft;
  @Indexed score;
}

@Error
class TooHighNft {
  no: U256;
}

@Error
class TooHighScore {
  amt: U256;
}

@Contract
export class NftRecommendation {
  static influencerCount: U256;
  static influencers: Mapping<U256, Address>;
  static scores: MappingNested<U256, U256, U256>;
  static opinions: MappingNested<Address, U256, U256>;

  @Internal
  @Pure
  static requireNftCountScore(i: U256, score: U256): void {
    if (i > U256Factory.fromString("10")) {
      TooHighNft.revert(i);
    }
    if (score > U256Factory.fromString("10")) {
      TooHighScore.revert(score);
    }
  }

  @External
  static revertMe(x: U256, y: U256): void {
    requireNftCountScore(x, y);
  }

  @External
  static registerInfluencer(i: U256, score: U256): void {
    requireNftCountScore(i, score);
    let influencerNo = influencers.get(msg.sender);
    if (influencerNo == U256Factory.create()) {
      influencerCount = influencerCount.add(U256Factory.fromString("1"));
      influencerNo = influencerCount;
      InfluencerRegistered.emit(msg.sender);
    }
    ScoreSet.emit(msg.sender, i, score);
    scores.set(influencerNo, i, score);
    influencerCount = influencerCount.add(U256Factory.fromString("1"));
  }

  @External
  static registerUser(i: U256, opinion: U256): void {
    requireNftCountScore(i, opinion);
    opinions.set(msg.sender, i, opinion);
  }

  @Internal
  @Pure
  static pow(x: U256, y: U256): U256 {
    const one = U256Factory.fromString("1");
    let acc = U256Factory.create();
    for (let i = U256Factory.create(); i < y; i = i.add(one)) {
      acc = acc.mul(acc);
    }
    return acc;
  }

  @External
  @View
  static getScore(user: Address): Address {
    const zero = U256Factory.create();
    const one = U256Factory.fromString("1");
    const two = U256Factory.fromString("2");
    let topAddr = U256Factory.create();
    let topScore = U256Factory.create();
    for (let influencerI = zero; influencerI < influencerCount; influencerI = influencerI.add(one)) {
      let sum = U256Factory.create();
      for (let nftI = zero; nftI < U256Factory.fromString("10"); nftI = nftI.add(one)) {
        const influencerScore = scores.get(influencerI, nftI);
        const userScore = opinions.get(user, nftI);
        sum = sum.add(pow(influencerScore.sub(userScore), two));
      }
      if (sum > topScore) {
        topAddr = influencerI;
        topScore = sum;
      }
    }
    return influencers.get(topAddr);
  }
}
