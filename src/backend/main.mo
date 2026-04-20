import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

actor {
  type TokenBalance = {
    token : Text;
    balance : Float;
    price : Float;
  };

  type MarketData = {
    token : Text;
    price : Float;
    change24h : Float;
  };

  type Transaction = {
    txType : Text;
    amount : Float;
    token : Text;
    timestamp : Time.Time;
  };

  type StakingPool = {
    poolName : Text;
    apy : Float;
    totalStaked : Float;
    userStaked : Float;
  };

  type UserProfile = {
    walletAddress : Text;
    network : Text;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.walletAddress, profile2.walletAddress);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  let mockTokenBalances : [TokenBalance] = [
    { token = "ETH"; balance = 2.5; price = 3000.0 },
    { token = "BTC"; balance = 1.2; price = 40000.0 },
    { token = "USDT"; balance = 5000.0; price = 1.0 },
  ];

  let mockMarketData : [MarketData] = [
    { token = "ETH"; price = 3000.0; change24h = 2.5 },
    { token = "BTC"; price = 40000.0; change24h = -1.2 },
    { token = "USDT"; price = 1.0; change24h = 0.0 },
  ];

  let mockTransactions : [Transaction] = [
    {
      txType = "deposit";
      amount = 1.0;
      token = "ETH";
      timestamp = 1_646_992_200_000_000_000;
    },
    {
      txType = "stake";
      amount = 0.5;
      token = "ETH";
      timestamp = 1_646_998_800_000_000_000;
    },
  ];

  let mockStakingPools : [StakingPool] = [
    {
      poolName = "ETH Pool";
      apy = 8.0;
      totalStaked = 10000.0;
      userStaked = 0.5;
    },
    {
      poolName = "BTC Pool";
      apy = 6.5;
      totalStaked = 15000.0;
      userStaked = 0.0;
    },
  ];

  public query ({ caller }) func getPortfolio() : async [TokenBalance] {
    mockTokenBalances;
  };

  public query ({ caller }) func getMarketData() : async [MarketData] {
    mockMarketData;
  };

  public query ({ caller }) func getTransactionHistory() : async [Transaction] {
    mockTransactions;
  };

  public query ({ caller }) func getStakingPools() : async [StakingPool] {
    mockStakingPools;
  };

  public shared ({ caller }) func setUserProfile(walletAddress : Text, network : Text) : async () {
    let profile : UserProfile = {
      walletAddress;
      network;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getAllUserProfiles() : async [UserProfile] {
    userProfiles.values().toArray().sort();
  };
};
