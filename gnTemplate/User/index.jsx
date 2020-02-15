import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Table } from 'antd'
import * as schema from './schema'
class User extends React.Component{
    render(){
        return (
            <PageHeaderWrapper title="User">
                <Card>
                    <Table
                        rowKey="id"
                        columns={schema.columns}
                        size="middle"
                    />
                </Card>
            </PageHeaderWrapper>)
    }
}

export default User