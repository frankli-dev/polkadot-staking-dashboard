// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const state = {
  eraLength: 0,
  eraProgress: 0,
  sessionLength: 0,
  sessionProgress: 0,
  sessionsPerEra: 0,
  unsub: undefined,
};

export const defaultSessionEraContext = {
  getEraTimeLeft: () => 0,
  sessionEra: {},
};

export default state;
