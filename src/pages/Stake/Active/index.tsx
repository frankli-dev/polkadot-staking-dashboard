// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import { useState, useEffect, useMemo } from 'react';
import { PageRowWrapper } from '../../../Wrappers';
import { MainWrapper, SecondaryWrapper } from '../../../library/Layout';
import { SectionWrapper } from '../../../library/Graphs/Wrappers';
import { StatBoxList } from '../../../library/StatBoxList';
import { useApi } from '../../../contexts/Api';
import { useStaking } from '../../../contexts/Staking';
import { useNetworkMetrics } from '../../../contexts/Network';
import { useBalances } from '../../../contexts/Balances';
import { getTotalUnlocking } from '../../../Utils';
import { useConnect } from '../../../contexts/Connect';
import { Nominations } from './Nominations';
import { ManageBond } from './ManageBond';
import { Button } from '../../../library/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRedoAlt,
  faWallet,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Separator } from '../../../Wrappers';
import { PageTitle } from '../../../library/PageTitle';
import { OpenAssistantIcon } from '../../../library/OpenAssistantIcon';
import { useModal } from '../../../contexts/Modal';
import StatBoxListItem from '../../../library/StatBoxList/Item';
import { useEraTimeLeft } from '../../../library/Hooks/useEraTimeleft';
import { useSessionEra } from '../../../contexts/SessionEra';

export const Active = (props: any) => {
  const { network }: any = useApi();
  const { units } = network;
  const { openModalWith } = useModal();
  const { activeAccount } = useConnect();
  const { metrics } = useNetworkMetrics();
  const { getNominationsStatus, eraStakers, staking } = useStaking();
  const { getAccountLedger, getBondedAccount, getAccountNominations }: any =
    useBalances();
  const { sessionEra } = useSessionEra();

  const eraTimeLeft = useEraTimeLeft();

  const { payee } = staking;
  const { minActiveBond } = eraStakers;
  const controller = getBondedAccount(activeAccount);
  const ledger = getAccountLedger(controller);
  const nominations = getAccountNominations(activeAccount);

  // handle nomination statuses
  const [nominationsStatus, setNominationsStatus]: any = useState({
    total: 0,
    inactive: 0,
    active: 0,
  });

  const nominationStatuses = useMemo(
    () => getNominationsStatus(),
    [nominations]
  );

  useEffect(() => {
    let statuses = nominationStatuses;
    let total = Object.values(statuses).length;
    let _active: any = Object.values(statuses).filter(
      (_v: any) => _v === 'active'
    ).length;

    setNominationsStatus({
      total: total,
      inactive: total - _active,
      active: _active,
    });
  }, [nominationStatuses]);

  let { unlocking } = ledger;
  let totalUnlocking = getTotalUnlocking(unlocking, units);

  // format era time left
  let _timeleft = moment.duration(eraTimeLeft * 1000, 'milliseconds');
  let timeleft = _timeleft.hours() + ":" + _timeleft.minutes() + ":" + _timeleft.seconds();

  const items = [
    {
      format: 'chart-pie',
      params: {
        label: 'Active Nominations',
        stat: {
          value: nominationsStatus.active,
          total: nominationsStatus.total,
          unit: '',
        },
        graph: {
          value1: nominationsStatus.active,
          value2: nominationsStatus.active ? 0 : 1,
        },
        tooltip: `${nominationsStatus.active ? `Active` : `Inactive`}`,
        assistant: {
          page: 'stake',
          key: 'Nominations',
        },
      },
    },
    {
      format: 'number',
      params: {
        label: 'Minimum Active Bond',
        value: minActiveBond,
        unit: network.unit,
        assistant: {
          page: 'stake',
          key: 'Bonding',
        },
      },
    },
    {
      format: 'chart-pie',
      params: {
        label: 'Active Era',
        stat: {
          value: metrics.activeEra.index,
          unit: '',
        },
        graph: {
          value1: sessionEra.eraProgress,
          value2: sessionEra.eraLength - sessionEra.eraProgress,
        },
        tooltip: timeleft,
        assistant: {
          page: 'validators',
          key: 'Era',
        },
      },
    },
  ];

  return (
    <>
      <PageTitle title={props.title} />
      <StatBoxList>
        {items.map((item: any, index: number) => (
          <StatBoxListItem {...item} key={index} />
        ))}
      </StatBoxList>
      <PageRowWrapper noVerticalSpacer>
        <MainWrapper paddingLeft>
          <SectionWrapper style={{ height: 260 }}>
            <div className="head">
              <h4>
                Status
                <OpenAssistantIcon page="stake" title="Staking Status" />
              </h4>
              <h2>
                {nominationsStatus.active
                  ? 'Active and Earning Rewards'
                  : 'Waiting for Active Nominations'}
              </h2>
              <Separator />
              <h4>
                Reward Destination
                <OpenAssistantIcon page="stake" title="Reward Destination" />
              </h4>
              <h2>
                <FontAwesomeIcon
                  icon={
                    payee === 'Staked'
                      ? faRedoAlt
                      : payee === 'None'
                        ? faCircle
                        : faWallet
                  }
                  transform="shrink-4"
                />
                &nbsp;
                {payee === 'Staked' && 'Back to Staking'}
                {payee === 'Stash' && 'To Stash'}
                {payee === 'Controller' && 'To Controller'}
                {payee === 'Account' && 'To Account'}
                {payee === 'None' && 'Not Set'}
                &nbsp;&nbsp;
                <div>
                  <Button
                    small
                    inline
                    primary
                    title="Update"
                    onClick={() => openModalWith('UpdatePayee', {}, 'small')}
                  />
                </div>
              </h2>
            </div>
          </SectionWrapper>
        </MainWrapper>
        <SecondaryWrapper>
          <SectionWrapper style={{ height: 260 }}>
            <ManageBond />
          </SectionWrapper>
        </SecondaryWrapper>
      </PageRowWrapper>
      <PageRowWrapper noVerticalSpacer>
        <SectionWrapper>
          <Nominations />
        </SectionWrapper>
      </PageRowWrapper>
    </>
  );
};

export default Active;
