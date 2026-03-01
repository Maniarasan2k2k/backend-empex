import React, { useState } from "react";
import { useGetNotificationsQuery, useMarkAllReadMutation, useMarkAsReadMutation } from '../../state/api';
import { DataGrid } from "@mui/x-data-grid";
import { Button, Chip } from "@mui/material";

const Notifications = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetNotificationsQuery({ page });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'message', headerName: 'Message', flex: 2 },
    { field: 'module', headerName: 'Module', flex: 1 },
    {
      field: 'type',
      headerName: 'Type',
      renderCell: (params) => <Chip label={params.value} color={getChipColor(params.value)} />,
    },
    { field: 'createdAt', headerName: 'Date', flex: 1 },
    {
      field: 'isRead',
      headerName: 'Status',
      renderCell: (params) => (params.value ? 'Read' : 'Unread'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleMarkAsRead(params.row.id)}
          disabled={params.row.isRead}
        >
          Mark as Read
        </Button>
      ),
    },
  ];

  const getChipColor = (type) => {
    switch (type) {
      case 'SUCCESS':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading notifications</div>;

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <Button variant="contained" color="secondary" onClick={handleMarkAllRead}>
        Mark All as Read
      </Button>
      <DataGrid
        rows={data?.data || []}
        columns={columns}
        pageSize={10}
        pagination
        onPageChange={(params) => setPage(params.page)}
        rowCount={data?.total || 0}
        loading={isLoading}
        getRowId={(row) => row._id} // Use _id as the unique identifier
      />
    </div>
  );
};

export default Notifications;
