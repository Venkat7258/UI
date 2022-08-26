export class GlobalConstants {
  static pageSizeOptions = [25, 50, 100, 250];
  static maxPageSizeOptions = [50, 75, 100, 250];
  static minPageSizeOptions = [10, 25, 50, 100, 250];
}

export enum PaginationDefalts {
  pageSize = GlobalConstants.minPageSizeOptions[0],
  pageNumber = 1,
  buttonCount = 5,
  pageSkip = 0,
  sortAscending = 1,
}

export class SearchFilter {
  pageNumber : number;
  pageSize : number;
  sort : string;
  sortAscending: number;
  sortExpression: string;
  buttonCount : number;
  pageSkip : number;
}


export enum ActiveInActiveStatus {
  ReActive = 'reactive',
  InActive = 'inactive'
}


export enum PrivilegCodes {
  VRML = 'VRML',
  ARM = 'ARM',
  MRM = 'MRM',
  VRM = 'VRM',
  IRM = 'IRM',
  RRM = 'RRM',
  RFL = 'RFL',
  ARF = 'ARF',
  MRF = 'MRF',
  VRF = 'VRF',
  IRF = 'IRF',
  RRF = 'RRF',
  MVRM = 'MVRM',
  MARM = 'MARM',
  MMR = 'MMR',
  MVR = 'MVR',
  MIRM = 'MIRM',
  MRRM = 'MRRM',
  IF = 'IF',
  FV = 'FV',
  MF = 'MF',
  ERC = 'ERC',
  VRC = 'VRC',
  RL='RL',
  VU='VU',
  RINCI='RINCI',
  CF='CF',
  RRC='RRC'
}