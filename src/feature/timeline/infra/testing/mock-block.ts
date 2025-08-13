import { v4 as uuid } from 'uuid';
import { Block } from '@/feature/timeline/entity/block';

export const mockBlocks = [
    {
        id: uuid(),
        timespan: {
            from: '8:00',
            to: '9:00',
        },
        title: 'Beat It',
    },
    {
        id: uuid(),
        timespan: {
            from: '9:15',
            to: '11:00',
        },
        title: 'Coffee & TV',
    },
    {
        id: uuid(),
        timespan: {
            from: '12:00',
            to: '13:00',
        },
        title: 'Run To The Store',
    },
    {
        id: uuid(),
        timespan: {
            from: '18:00',
            to: '22:00',
        },
        title: 'Take It Easy',
    }
] satisfies Block[];
