// @ts-nocheck

@Event
export class InfluencerRegistered {
  @Indexed influencer: Address;
}

@Event
export class ScoreSet {
  @Indexed scorer: Address;
  @Indexed nft: U256;
  @Indexed score: U256;
  pos: U256;
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
  static influencerIds: Mapping<Address, U256>;
  static influencerAddrs: Mapping<U256, Address>;
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
  static getInfluencerCount(): U256 {
    return influencerCount;
  }

  @External
  static getInfluencerNo(addr: Address): U256 {
    return scores.get(influencerCount.get(addr));
  }

@External
static registerInfluencer(i: U256, score: U256): void {
  requireNftCountScore(i, score);
  if (influencerIds.get(msg.sender) == U256Factory.create()) {
    influencerCount = influencerCount.add(U256Factory.fromString("1"));
    influencerIds.set(msg.sender, influencerCount);
    influencerAddrs.set(influencerCount, msg.sender);
    InfluencerRegistered.emit(msg.sender);
  }
  ScoreSet.emit(msg.sender, i, score, influencerCount);
  scores.set(influencerIds.get(msg.sender), i, score);
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
    let acc = U256Factory.fromString("1");
    for (let i = U256Factory.create(); i < y; i = i.add(one)) {
      acc = acc.mul(x);
    }
    return acc;
  }

  @External
  @View
  static getScore(user: Address): Address {
    const zero = U256Factory.create();
    const one = U256Factory.fromString("1");
    const two = U256Factory.fromString("2");
    let topId = zero;
    let topScore = zero;
    for (let influencerI = one; influencerI <= influencerCount; influencerI = influencerI.add(one)) {
      let sum = U256Factory.create();
      for (let nftI = zero; nftI < U256Factory.fromString("10"); nftI = nftI.add(one)) {
        const influencerScore = scores.get(influencerI, nftI);
        const userScore = opinions.get(user, nftI);
        let abs = U256Factory.create();
        if (influencerScore > userScore) abs = influencerScore.sub(userScore);
        else abs = userScore.sub(influencerScore);
        sum = sum.add(pow(abs, two));
      }
      if (topScore == zero || topScore > sum) {
        topId = influencerI;
        topScore = sum;
      }
    }
    return influencerAddrs.get(topId);
  }
}
