import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'producers.index': { paramsTuple?: []; params?: {} }
    'producers.store': { paramsTuple?: []; params?: {} }
    'producers.show': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'producers.update': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'producers.destroy': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.index': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.store': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.show': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'farms.update': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'farms.destroy': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'harvests.index': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'harvests.store': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'harvests.update': { paramsTuple: [ParamValue]; params: {'idHarvest': ParamValue} }
    'harvests.destroy': { paramsTuple: [ParamValue]; params: {'idHarvest': ParamValue} }
    'dashboard.show': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'audit.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'producers.store': { paramsTuple?: []; params?: {} }
    'farms.store': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'harvests.store': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
  }
  GET: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'producers.index': { paramsTuple?: []; params?: {} }
    'producers.show': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.index': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.show': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'harvests.index': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'dashboard.show': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'audit.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'producers.index': { paramsTuple?: []; params?: {} }
    'producers.show': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.index': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.show': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'harvests.index': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'dashboard.show': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'audit.index': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'auth.logout': { paramsTuple?: []; params?: {} }
    'producers.destroy': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.destroy': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'harvests.destroy': { paramsTuple: [ParamValue]; params: {'idHarvest': ParamValue} }
  }
  PATCH: {
    'producers.update': { paramsTuple: [ParamValue]; params: {'idProducer': ParamValue} }
    'farms.update': { paramsTuple: [ParamValue]; params: {'idFarm': ParamValue} }
    'harvests.update': { paramsTuple: [ParamValue]; params: {'idHarvest': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}